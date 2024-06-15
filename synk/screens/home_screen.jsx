import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleSignOut } from '../services/authService';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, updateDoc, where, limit } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const firestore = getFirestore();
    const auth = getAuth();

    const fetchCompetitions = async () => {
        try {
            const competitionsColRef = collection(firestore, 'competitions');
            const competitionsSnapshot = await getDocs(competitionsColRef);
            const competitionsList = [];

            for (const compDoc of competitionsSnapshot.docs) {
                const compData = compDoc.data();
                let winnerDJ = null;
                if (compData.winner) {
                    const winnerDocRef = doc(firestore, 'submissions', compData.winner);
                    const winnerDocSnap = await getDoc(winnerDocRef);
                    if (winnerDocSnap.exists) {
                        const winnerData = winnerDocSnap.data();
                        if (winnerData && winnerData.userId) {
                            const userDocRef = doc(firestore, 'users', winnerData.userId);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists) {
                                winnerDJ = userDocSnap.data().name;
                            }
                        }
                    }
                }
                competitionsList.push({
                    id: compDoc.id,
                    ...compData,
                    winnerDJ,
                });
            }

            setCompetitions(competitionsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching competitions: ", error);
            setLoading(false);
        }
    };

    const closeCompetitions = async () => {
        try {
            const now = new Date();
            const competitionsColRef = collection(firestore, 'competitions');
            const competitionsSnapshot = await getDocs(competitionsColRef);

            for (const competitionDoc of competitionsSnapshot.docs) {
                const competition = competitionDoc.data();
                const competitionId = competitionDoc.id;

                if (competition.status === 'open' && competition.endDate.toDate() <= now) {
                    const submissionsColRef = collection(firestore, 'submissions');
                    const submissionsSnapshot = await getDocs(query(submissionsColRef, where('genre', '==', competition.name), orderBy('votes', 'desc'), limit(1)));

                    if (!submissionsSnapshot.empty) {
                        const winnerDoc = submissionsSnapshot.docs[0];
                        const winnerId = winnerDoc.id;

                        await updateDoc(doc(firestore, 'competitions', competitionId), {
                            status: 'closed',
                            winner: winnerId,
                        });

                        console.log(`Competition ${competition.name} is closed. Winner: ${winnerId}`);
                    } else {
                        await updateDoc(doc(firestore, 'competitions', competitionId), { status: 'closed' });
                    }
                }
            }

            await fetchCompetitions(); // Refresh competitions list after closing some
        } catch (error) {
            console.error("Error closing competitions: ", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchCompetitions();
            closeCompetitions();
        }, [])
    );

    const handleCompetitionPress = (competition) => {
        if (competition.status === 'open') {
            navigation.navigate('GenreScreen', { genre: competition.name });
        } else {
            navigation.navigate('Winners', {
                screen: 'WinnersScreen',
                params: { highlightSubmissionId: competition.winner },
            });
        }
    };

    const renderCompetition = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, item.status === 'closed' ? styles.closedCard : styles.openCard]}
            onPress={() => handleCompetitionPress(item)}
            disabled={item.status === 'closed' && !item.winner}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.statusText}>{item.status === 'open' ? 'Open' : 'Closed'}</Text>
            {item.status === 'closed' && item.winnerDJ && (
                <Text style={styles.winnerText}>Winner: {item.winnerDJ}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.header}>SynK</Text>
                <Button title="Sign Out" color="green" onPress={handleSignOut} />
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={competitions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCompetition}
                        style={styles.flatlist_style}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleContainer: {
        paddingTop: 25,
        alignItems: 'center',
        textAlign: 'center',
    },
    header: {
        fontSize: 64,
        padding: 20,
        paddingTop: 45,
    },
    flatlist_style: {
        width: '100%',
        height: '100%',
    },
    card: {
        height: 130,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginVertical: 10,
        padding: 10,
    },
    openCard: {
        backgroundColor: '#E15A19',
    },
    closedCard: {
        backgroundColor: '#A9A9A9',
    },
    cardText: {
        fontSize: 32,
        color: 'white',
    },
    statusText: {
        fontSize: 18,
        color: 'white',
    },
    winnerText: {
        fontSize: 16,
        color: 'white',
    },
});
