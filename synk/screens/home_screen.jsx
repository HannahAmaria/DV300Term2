import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';  // Adjust path according to your project structure
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { handleSignOut } from '../services/authService.js';


export default function HomeScreen({ navigation }) {

    const handleLogout = () => {
        handleSignOut()
    }


    return (
        <SafeAreaView>
            <View style={styles.titleContainer}>
                <Text style={styles.header}>SynK</Text>

                <Button
                    title="Sign Out"
                    color="green"
                    onPress={handleLogout} />

                <Text style={styles.titleText}>Fresh Remixes</Text>

                <View style={styles.card}>
                    <Link href={'./read'} asChild>
                        <Text style={styles.cardText}>R&B</Text>
                    </Link>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardText}>Hip-Hop</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardText}>House</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 25
    },
    header: {
        fontFamily: 'Roboto',
        fontSize: 64,
        padding: 20,
        paddingTop: 45
    },
    titleText: {
        fontFamily: 'Roboto',
        fontSize: 40,
        padding: 50
    },
    card: {
        height: 130,
        width: 350,
        backgroundColor: '#E15A19',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        marginRight: -25,
        marginLeft: -25,
        marginBottom: 50
    },
    cardText: {
        fontFamily: 'Roboto',
        fontSize: 32,
        color: 'white',
        paddingTop: 20
    }
});
