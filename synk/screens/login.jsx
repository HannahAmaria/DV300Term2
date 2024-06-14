import { BackHandler, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Link } from 'expo-router';

import { handlelogin } from '../services/authService.js'

const LogIn = ({ navigation }) => {
    // const [email, onChangeEmail] = useState('example@gmail.com');
    // const [password, onChangePassword] = useState('Password');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const login = () => {
        handlelogin(email, password);
    }

    const styles = StyleSheet.create({
        titleContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 25
        },
        titleText: {
            fontFamily: 'Roboto',
            fontSize: 40,
            padding: 20,
            marginTop: 80
        },
        inputText: {
            fontFamily: 'Roboto',
            fontSize: 32,
            padding: 20,
            marginTop: 20
        },
        submit: {
            backgroundColor: '#E15A19',
            paddingTop: 18,
            paddingBottom: 12,
            paddingLeft: 30,
            paddingEnd: 30,
            borderRadius: 12,
            marginTop: 50
        },
        submitText: {
            color: 'white',
            fontFamily: 'Roboto',
            fontSize: 24
        },
        logInText: {
            textDecorationLine: 'underline',
            fontFamily: 'Roboto',
            fontSize: 24,
            marginTop: 100
        }
    });

    return (
        <SafeAreaView>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    Log In
                </Text>

                <Text style={styles.inputText}>
                    Email
                </Text>
                <TextInput
                    editable
                    maxLength={60}
                    placeholder="Enter Email"
                    onChangeText={newText => setEmail(newText)}
                    defaultValue={email}
                    style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16 }}
                />

                <Text style={styles.inputText}>
                    Password
                </Text>
                <TextInput
                    editable
                    maxLength={60}
                    placeholder="Enter Password"
                    onChangeText={newText => setPassword(newText)}
                    defaultValue={password}
                    style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16 }}
                />

                <View style={styles.submit}>
                    <TouchableOpacity onPress={login} >
                        {/* <Pressable> */}
                            <Text style={styles.submitText}>
                                LOG IN
                            </Text>
                        {/* </Pressable> */}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.logInText}>
                        Create acount here.
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

export default LogIn;
