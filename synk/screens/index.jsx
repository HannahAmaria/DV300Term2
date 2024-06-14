import { Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { handleregister } from '../services/authService.js';

import ModalSelector from 'react-native-modal-selector'

const SignUp = ({ navigation }) => {

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (name.trim() && surname.trim() && email.trim() && password.trim() && userType) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [name, surname, email, password, userType]);

  const register = async () => {
    if (!isFormValid) {
      Alert.alert("Validation Error", "Please fill all the required fields.");
      return;
    }

    const items = { name, surname, email, password, userType };
    const success = await handleregister(items);

    if (success) {
      Alert.alert("Success", "User registered successfully.");
      // navigation.goBack();
    } else {
      Alert.alert("Error", "Failed to create new user. Please try again.");
    }
  };

  
  const userTypeData = [
    { key: 1, label: 'Normal User' },
    { key: 2, label: 'DJ' }
  ];


  const styles = StyleSheet.create({
    titleContainer: {
      display: 'flex',
      // flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'space-between'
      // paddingTop: 25
    },
    titleText: {
      fontFamily: 'Roboto',
      fontSize: 40,
      padding: 20,
      // marginTop: 80
    },
    inputText: {
      fontFamily: 'Roboto',
      fontSize: 32,
      padding: 20,
      // marginTop: 20
    },
    pickerContainer: {
      backgroundColor: '#E4DED6',
      borderRadius: 12,
      width: 350,
      height: 45,
      justifyContent: 'center',
      marginBottom: 20,
    },
    pickerText: {
      padding: 10,
      fontSize: 16,
    },
    submit: {
      backgroundColor: '#E15A19',
      paddingTop: 18,
      paddingBottom: 12,
      paddingLeft: 30,
      paddingEnd: 30,
      borderRadius: 12,
      marginTop: 10
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
      marginTop: 10
    }
  });

  return (
    <SafeAreaView>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          Sign Up
        </Text>

        {/* <Text style={styles.inputText}>
          Name
        </Text> */}
        <TextInput
          editable
          maxLength={60}
          placeholder="Name"
          onChangeText={setName}
          value={name}
          style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
        />

        {/* <Text style={styles.inputText}>
          Surname
        </Text> */}
        <TextInput
          editable
          maxLength={60}
          placeholder="Surname"
          onChangeText={setSurname}
          value={surname}
          style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
        />

        {/* <Text style={styles.inputText}>
          Email
        </Text> */}
        <TextInput
          editable
          maxLength={60}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
        />

        {/* <Text style={styles.inputText}>User Type</Text> */}
        <ModalSelector
          data={userTypeData}
          initValue="Select user type"
          onChange={(option) => setUserType(option.label)}
          // style={styles.pickerContainer}
          // style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
        >
          <TextInput
            // style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, height: 45, backgroundColor: '#E4DED6' }}
            style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
            editable={false}
            placeholder="Select user type"
            value={userType}
          />
        </ModalSelector>

        {/* <Text style={styles.inputText}>
          Password
        </Text> */}
        <TextInput
          editable
          maxLength={60}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          style={{ padding: 10, backgroundColor: '#E4DED6', width: 350, height: 45, borderRadius: 12, fontSize: 16, marginTop: 20 }}
        />

        <View style={styles.submit}>
          <TouchableOpacity onPress={register} disabled={!isFormValid}>
            {/* <Pressable> */}
            <Text style={styles.submitText}>
              REGISTER
            </Text>
            {/* </Pressable> */}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('LogIn')} >
          <Text style={styles.logInText}>
            Login Here.
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}

export default SignUp;
