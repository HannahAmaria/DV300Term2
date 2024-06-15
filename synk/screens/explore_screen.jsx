import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { getAuth } from 'firebase/auth';

const RemixListScreen = () => {
    const [remixes, setRemixes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingAudioIndex, setLoadingAudioIndex] = useState(null);
    const [sound, setSound] = useState(null);
    const firestore = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const fetchRemixes = async () => {
            try {
                setLoading(true);
                const remixesColRef = collection(firestore, 'submissions');
                const remixesQuery = query(remixesColRef, orderBy('votes', 'desc'));
                const querySnapshot = await getDocs(remixesQuery);
                const fetchedRemixes = [];
                await Promise.all(querySnapshot.docs.map(async (submissionDoc) => {
                    const data = submissionDoc.data();
                    if (data.userId) {
                        const userDocRef = doc(firestore, 'users', data.userId);
                        const userDocSnap = await getDoc(userDocRef);
                        const uploaderName = userDocSnap.exists() ? userDocSnap.data().name : 'Unknown';

                        // Fetch user vote status
                        const voteDocRef = doc(firestore, 'submissions', submissionDoc.id, 'votes', auth.currentUser.uid);
                        const voteDocSnap = await getDoc(voteDocRef);
                        const userVote = voteDocSnap.exists() ? voteDocSnap.data().type : null;

                        fetchedRemixes.push({ id: submissionDoc.id, uploaderName, userVote, ...data });
                    }
                }));
                setRemixes(fetchedRemixes);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching remixes: ", error);
                Alert.alert('Error', 'Failed to fetch remixes');
            }
        };

        fetchRemixes();

        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, []);

    const handlePlayPause = async (index, fileUrl) => {
        try {
            setLoadingAudioIndex(index);

            if (playingIndex === index) {
                await sound.pauseAsync();
                setPlayingIndex(null);
                setLoadingAudioIndex(null);
            } else {
                if (sound) {
                    await sound.unloadAsync();
                }
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: fileUrl },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setPlayingIndex(index);
                setLoadingAudioIndex(null);
            }
        } catch (error) {
            console.error("Error playing audio: ", error);
            setLoadingAudioIndex(null);
        }
    };

    const handleVote = async (id, type) => {
        try {
            const remixDocRef = doc(firestore, 'submissions', id);
            const voteDocRef = doc(firestore, 'submissions', id, 'votes', auth.currentUser.uid);
            const voteDocSnap = await getDoc(voteDocRef);
            let voteChange = 0;
            let newVoteType = null;

            if (voteDocSnap.exists()) {
                const existingVote = voteDocSnap.data().type;
                if (existingVote === type) {
                    // Remove vote if the same vote is clicked again
                    await deleteDoc(voteDocRef);
                    voteChange = type === 'upvote' ? -1 : 1;
                } else {
                    // Switch vote from upvote to downvote or vice versa
                    await updateDoc(voteDocRef, { type });
                    voteChange = type === 'upvote' ? 2 : -2;
                    newVoteType = type;
                }
            } else {
                // New vote
                await setDoc(voteDocRef, { type });
                voteChange = type === 'upvote' ? 1 : -1;
                newVoteType = type;
            }

            await updateDoc(remixDocRef, { votes: increment(voteChange) });

            // Update local state
            setRemixes((prevRemixes) =>
                prevRemixes.map((remix) =>
                    remix.id === id
                        ? { ...remix, votes: (remix.votes || 0) + voteChange, userVote: newVoteType ? newVoteType : null }
                        : remix
                ).sort((a, b) => b.votes - a.votes) // Sort by votes in descending order
            );
        } catch (error) {
            console.error("Error updating votes: ", error);
            Alert.alert('Error', 'Failed to update votes');
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.remixItem}>
            <Image source={{ uri: item.coverUrl }} style={styles.cover} />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.uploader}>Uploaded by: {item.uploaderName}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.description}>Genre: {item.genre}</Text>
                <Text style={styles.votes}>Votes: {item.votes || 0}</Text>
                <View style={styles.voteButtons}>
                    <Button
                        title={item.userVote === 'upvote' ? "Remove Upvote" : "Upvote"}
                        onPress={() => handleVote(item.id, 'upvote')}
                    />
                    <Button
                        title={item.userVote === 'downvote' ? "Remove Downvote" : "Downvote"}
                        onPress={() => handleVote(item.id, 'downvote')}
                    />
                </View>
                {loadingAudioIndex === index
                    ? <ActivityIndicator size="small" color="#0000ff" />
                    : <Button
                        title={playingIndex === index ? "Pause" : "Play"}
                        onPress={() => handlePlayPause(index, item.fileUrl)}
                    />
                }
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.inputText}>
                User Submissions
            </Text>
            <FlatList style={styles.flatlist_style}
                data={remixes}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        marginTop: 50,
    },
    remixItem: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cover: {
        width: 100,
        height: 100,
        borderRadius: 5,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    uploader: {
        color: 'gray',
    },
    description: {
        marginVertical: 5,
    },
    votes: {
        marginTop: 5,
        fontWeight: 'bold',
    },
    voteButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatlist_style: { flex: 1 },
    inputText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default RemixListScreen;
