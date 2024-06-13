// import { BackHandler, Pressable, StyleSheet, TextInput } from 'react-native';

// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useState } from 'react';
// import { Link } from 'expo-router';

// const logIn = () => {
//     const [email, onChangeEmail] = useState('example@gmail.com');
//     const [password, onChangePassword] = useState('Password');

//     const styles = StyleSheet.create({
//         titleContainer: {
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             textAlign: 'center',
//             paddingTop: 25
//         },
//         titleText: {
//             fontFamily: 'Roboto',
//             fontSize: 40,
//             padding: 20,
//             marginTop: 80
//         },
//         inputText: {
//             fontFamily: 'Roboto',
//             fontSize: 32,
//             padding: 20,
//             marginTop: 20
//         },
//         submit: {
//             backgroundColor: '#E15A19',
//             paddingTop: 18,
//             paddingBottom: 12,
//             paddingLeft: 30,
//             paddingEnd: 30,
//             borderRadius: 12,
//             marginTop: 50
//         },
//         submitText: {
//             color: 'white',
//             fontFamily: 'Roboto',
//             fontSize: 24
//         },
//         logInText: {
//             textDecorationLine: 'underline',
//             fontFamily: 'Roboto',
//             fontSize: 24,
//             marginTop: 100
//         }
//     });

//     return (
//         <SafeAreaView>
//             <ThemedView style={styles.titleContainer}>
//                 <ThemedText style={styles.titleText}>
//                     Log In
//                 </ThemedText>

//                 <ThemedText style={styles.inputText}>
//                     Email
//                 </ThemedText>
//                 <TextInput
//                     editable
//                     maxLength={60}
//                     onChangeText={email => onChangeEmail(email)}
//                     value={email}
//                     style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16 }}
//                 />

//                 <ThemedText style={styles.inputText}>
//                     Password
//                 </ThemedText>
//                 <TextInput
//                     editable
//                     maxLength={60}
//                     onChangeText={password => onChangePassword(password)}
//                     value={password}
//                     style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16 }}
//                 />

//                 {/* Routes to one file above, then the home folder, where it goes to 'home/index', however to route accurately only '/' is needed */}
//                 <ThemedView style={styles.submit}>
//                     <Link href={'../home/'} asChild>
//                         <Pressable>
//                             <ThemedText style={styles.submitText}>
//                                 Submit
//                             </ThemedText>
//                         </Pressable>
//                     </Link>
//                 </ThemedView>

//                 {/* Do not use '/index' as '/' routes to index. '/index' does not route to anything */}
//                 {/* asChild applies the routing of the link to the children, in this case the ThemedText */}
//                 <Link href={'/'} asChild>
//                     <ThemedText style={styles.logInText}>
//                         Sign Up
//                     </ThemedText>
//                 </Link>

//             </ThemedView>
//         </SafeAreaView>
//     );
// }

// export default logIn