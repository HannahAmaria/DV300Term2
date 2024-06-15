import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TouchableOpacity } from 'react-native';  // Adjust path according to your project structure
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { handleSignOut } from '../services/authService.js';
import { getFirestore, collection, getDocs, query, distinct, orderBy } from 'firebase/firestore'; // Import Firestore

export default function HomeScreen({ navigation }) {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const firestore = getFirestore();
                const submissionsColRef = collection(firestore, 'submissions');
                const genresQuery = query(submissionsColRef, orderBy('genre'));
                const submissionsSnapshot = await getDocs(genresQuery);

                const genreSet = new Set();
                submissionsSnapshot.forEach((doc) => {
                    genreSet.add(doc.data().genre);
                });

                setGenres(Array.from(genreSet));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching genres: ", error);
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    const handleGenrePress = (genre) => {
        navigation.navigate('GenreScreen', { genre });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.header}>SynK</Text>
                <Button title="Sign Out" color="green" onPress={handleSignOut} />
                {loading ? <Text>Loading genres...</Text> :
                    <FlatList
                        data={genres}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.card} onPress={() => handleGenrePress(item)}>
                                <Text style={styles.cardText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.flatlist_style}
                    />
                }
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
        backgroundColor: '#E15A19',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginVertical: 10,
    },
    cardText: {
        fontSize: 32,
        color: 'white',
    },
});

