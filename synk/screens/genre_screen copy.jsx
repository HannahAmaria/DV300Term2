import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { getAuth } from 'firebase/auth';

const GenreScreen = ({ route, navigation }) => {
    const { genre } = route.params;
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
                const remixesQuery = query(remixesColRef, where('genre', '==', genre), orderBy('votes', 'desc'));
                const querySnapshot = await getDocs(remixesQuery);

                const fetchedRemixes = await Promise.all(querySnapshot.docs.map(async (submissionDoc) => {
                    const data = submissionDoc.data();
                    console.log(`Fetched submission for genre ${genre}:`, data);

                    const userDocRef = doc(firestore, 'users', data.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    const uploaderName = userDocSnap.exists() ? userDocSnap.data().name : 'Unknown';

                    const voteDocRef = doc(firestore, 'submissions', submissionDoc.id, 'votes', auth.currentUser.uid);
                    const voteDocSnap = await getDoc(voteDocRef);
                    const userVote = voteDocSnap.exists() ? voteDocSnap.data().type : null;

                    return { id: submissionDoc.id, uploaderName, userVote, ...data };
                }));

                setRemixes(fetchedRemixes);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching remixes: ", error);
                Alert.alert('Error', 'Failed to fetch remixes');
                setLoading(false);
            }
        };

        fetchRemixes();

        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [genre]);

    const handlePlayPause = async (index, fileUrl) => {
        try {
            setLoadingAudioIndex(index);
            if (playingIndex === index) {
                await sound.pauseAsync();
                setPlayingIndex(null);
            } else {
                if (sound) {
                    await sound.unloadAsync();
                }
                const { sound: newSound } = await Audio.Sound.createAsync({ uri: fileUrl }, { shouldPlay: true });
                setSound(newSound);
                setPlayingIndex(index);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to play audio');
        } finally {
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
                    await deleteDoc(voteDocRef);
                    voteChange = type === 'upvote' ? -1 : 1;
                } else {
                    await updateDoc(voteDocRef, { type });
                    voteChange = type === 'upvote' ? 2 : -2;
                    newVoteType = type;
                }
            } else {
                await setDoc(voteDocRef, { type });
                voteChange = type === 'upvote' ? 1 : -1;
                newVoteType = type;
            }
            await updateDoc(remixDocRef, { votes: increment(voteChange) });
            setRemixes((prev) =>
                prev.map((remix) =>
                    remix.id === id ? { ...remix, votes: remix.votes + voteChange, userVote: newVoteType } : remix
                )
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to vote');
        }
    };

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> :
                <FlatList
                    data={remixes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <View style={styles.remixCard}>
                            <Text>{item.title}</Text>
                            <Text>Uploaded by: {item.uploaderName}</Text>
                            <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
                            <View style={styles.buttonContainer}>
                                <Button
                                    title={playingIndex === index ? 'Pause' : 'Play'}
                                    onPress={() => handlePlayPause(index, item.fileUrl)}
                                    disabled={loadingAudioIndex === index}
                                />
                                <Button
                                    title="Upvote"
                                    onPress={() => handleVote(item.id, 'upvote')}
                                    color={item.userVote === 'upvote' ? 'green' : 'gray'}
                                />
                                <Button
                                    title="Downvote"
                                    onPress={() => handleVote(item.id, 'downvote')}
                                    color={item.userVote === 'downvote' ? 'red' : 'gray'}
                                />
                                <Text>Votes: {item.votes}</Text>
                            </View>
                        </View>
                    )}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    remixCard: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
    },
    coverImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default GenreScreen;
