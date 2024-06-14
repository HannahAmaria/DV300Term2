import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { getAuth } from 'firebase/auth';

const RemixListScreen = () => {
    const [remixes, setRemixes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingAudioIndex, setLoadingAudioIndex] = useState(null); // New State
    const [sound, setSound] = useState(null);
    const firestore = getFirestore();

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
                        fetchedRemixes.push({ id: submissionDoc.id, uploaderName, ...data });
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
            setLoadingAudioIndex(index); // Set loading state

            if (playingIndex === index) {
                await sound.pauseAsync();
                setPlayingIndex(null);
                setLoadingAudioIndex(null); // Reset loading state
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
                setLoadingAudioIndex(null); // Reset loading state when loaded
            }
        } catch (error) {
            console.error("Error playing audio: ", error);
            setLoadingAudioIndex(null); // Reset loading state on error
        }
    };

    const handleVote = async (id, type) => {
        try {
            const remixDocRef = doc(firestore, 'submissions', id);
            if (type === 'upvote') {
                await updateDoc(remixDocRef, { votes: increment(1) });
            } else {
                await updateDoc(remixDocRef, { votes: increment(-1) });
            }
            // Update local state to reflect the changes immediately
            setRemixes((prevRemixes) =>
                prevRemixes
                    .map((remix) =>
                        remix.id === id ? { ...remix, votes: (remix.votes || 0) + (type === 'upvote' ? 1 : -1) } : remix
                    )
                    .sort((a, b) => b.votes - a.votes)  // Sort by votes in descending order
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
                <Text style={styles.votes}>Votes: {item.votes || 0}</Text>
                <View style={styles.voteButtons}>
                    <Button title="Upvote" onPress={() => handleVote(item.id, 'upvote')} />
                    <Button title="Downvote" onPress={() => handleVote(item.id, 'downvote')} />
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
    },
    flatlist_style: {
        marginTop: 80,
    },
    remixItem: {
        flexDirection: 'row',
        marginBottom: 20
    },
    cover: {
        width: 100,
        height: 100,
        marginRight: 10
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    uploader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5
    },
    description: {
        fontSize: 14,
        marginBottom: 10
    },
    votes: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10
    },
    voteButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputText: {
        fontFamily: 'Roboto',
        fontSize: 32,
        padding: 20,
        marginTop: 20
    },
});

export default RemixListScreen;
