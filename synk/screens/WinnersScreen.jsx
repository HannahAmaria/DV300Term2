import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Button, Animated } from 'react-native';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { useRoute } from '@react-navigation/native';

const WinnersScreen = () => {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingAudioIndex, setLoadingAudioIndex] = useState(null);
    const [sound, setSound] = useState(null);
    const [highlightSubmissionId, setHighlightSubmissionId] = useState(null);

    const firestore = getFirestore();
    const route = useRoute();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    useEffect(() => {
        if (route.params && route.params.highlightSubmissionId) {
            setHighlightSubmissionId(route.params.highlightSubmissionId);
        }
    }, [route.params]);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const competitionsColRef = collection(firestore, 'competitions');
                const snapshot = await getDocs(query(competitionsColRef, where('status', '==', 'closed')));

                const winnersList = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                    const competition = docSnapshot.data();
                    const winnerId = competition.winner;
                    if (winnerId) {
                        const winnerDocRef = doc(firestore, 'submissions', winnerId);
                        const winnerDocSnap = await getDoc(winnerDocRef);
                        if (winnerDocSnap.exists) {
                            const winnerData = winnerDocSnap.data();
                            if (winnerData && winnerData.userId) {
                                const userDocRef = doc(firestore, 'users', winnerData.userId);
                                const userDocSnap = await getDoc(userDocRef);
                                if (userDocSnap.exists) {
                                    const djName = userDocSnap.data().name;
                                    return {
                                        id: winnerId,
                                        djName,
                                        remix: {
                                            title: winnerData.title,
                                            fileUrl: winnerData.fileUrl,
                                            votes: winnerData.votes,
                                            coverUrl: winnerData.coverUrl,
                                        },
                                        genre: competition.name,
                                    };
                                }
                            }
                        }
                    }
                    return null;
                }));

                setWinners(winnersList.filter((item) => item !== null));
                setLoading(false);

                // Trigger fade in animation
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            } catch (error) {
                console.error("Error fetching winners: ", error);
                setLoading(false);
            }
        };

        fetchWinners();

        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, []);

    useEffect(() => {
        if (highlightSubmissionId && winners.length > 0) {
            const index = winners.findIndex(winner => winner.id === highlightSubmissionId);
            if (index !== -1 && flatListRef.current) {
                flatListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    }, [highlightSubmissionId, winners]);

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
            console.error('Error', 'Failed to play audio', error);
        } finally {
            setLoadingAudioIndex(null);
        }
    };

    const renderWinner = ({ item, index }) => (
        <Animated.View
            style={[
                styles.card,
                item.id === highlightSubmissionId ? styles.highlightCard : null,
                { opacity: fadeAnim },
            ]}>
            <Text style={styles.cardText}>{item.djName}</Text>
            <Text style={styles.genreText}>Genre: {item.genre}</Text>
            <Text style={styles.remixText}>Remix: {item.remix.title}</Text>
            {item.remix.coverUrl && <Image source={{ uri: item.remix.coverUrl }} style={styles.coverImage} />}
            <Text style={styles.votesText}>Votes: {item.remix.votes}</Text>
            <View style={styles.buttonContainer}>
                {loadingAudioIndex === index ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                    <Button
                        title={playingIndex === index ? 'Pause' : 'Play'}
                        onPress={() => handlePlayPause(index, item.remix.fileUrl)}
                    />
                )}
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Text style={styles.inputText}>Winners</Text>
                    <FlatList
                        data={winners}
                        keyExtractor={(item) => item.id}
                        renderItem={renderWinner}
                        ref={flatListRef}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
    },
    highlightCard: {
        borderColor: '#E15A19',
        borderWidth: 5,
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    genreText: {
        fontSize: 16,
    },
    remixText: {
        fontSize: 16,
        marginVertical: 5,
    },
    votesText: {
        fontSize: 14,
        textAlign: 'center',
    },
    coverImage: {
        width: '100%',
        height: 200,
        marginVertical: 10,
        borderRadius: 10,
    },
    inputText: {
        fontFamily: 'Roboto',
        fontSize: 32,
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WinnersScreen;
