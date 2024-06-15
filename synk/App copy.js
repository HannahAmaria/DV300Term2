import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';

import SignUp from './screens/index.jsx';
import LogIn from './screens/login.jsx';
import HomeScreen from './screens/home_screen.jsx';
import SubmissionScreen from './screens/submission_screen.jsx';
import RemixListScreen from './screens/explore_screen.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size = 26 }) => {
  return <Ionicons name={name} size={size} color={color} />;
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { userType } = docSnap.data();
          setUserType(userType);
          console.log(userType);
        }
      } else {
        setLoggedIn(false);
        setUserType(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {loggedIn ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="HomeScreen"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
              ),
            }}
            component={HomeScreen}
          />
          {userType === "DJ" ? (
            <Tab.Screen
              name="Submit"
              options={{
                title: 'Submit',
                tabBarIcon: ({ color, focused }) => (
                  <TabBarIcon name={focused ? 'cloud-upload' : 'cloud-upload-outline'} color={color} />
                ),
              }}
              component={SubmissionScreen}
            />
          ) : (
            <Tab.Screen
              name="Explore"
              options={{
                title: 'Explore',
                tabBarIcon: ({ color, focused }) => (
                  <TabBarIcon name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} />
                ),
              }}
                component={RemixListScreen}
            />
          )}
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              title: 'SIGN UP',
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' }
            }}
          />
          <Stack.Screen
            name="LogIn"
            component={LogIn}
            options={{
              title: 'LOGIN',
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' }
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
