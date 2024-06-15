import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Ionicons } from 'react-native-vector-icons';

import SignUp from './screens/index';
import LogIn from './screens/login';
import HomeScreen from './screens/home_screen';
import SubmissionScreen from './screens/submission_screen';
import RemixListScreen from './screens/explore_screen';
import GenreScreen from './screens/genre_screen';
import WinnersScreen from './screens/WinnersScreen.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size = 26 }) => {
  return <Ionicons name={name} size={size} color={color} />;
};

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GenreScreen"
      component={GenreScreen}
      options={{ title: 'Genre' }}
    />
    <Stack.Screen
      name="WinnersScreen"
      component={WinnersScreen}
      options={{ title: 'Winner' }}
    />
  </Stack.Navigator>
);

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
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen
            name="HomeStack"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? 'home' : 'home-outline'}
                  color={color}
                />
              ),
            }}
            component={HomeStack}
          />
          {userType === 'DJ' ? (
            <Tab.Screen
              name="Submit"
              options={{
                title: 'Submit',
                tabBarIcon: ({ color, focused }) => (
                  <TabBarIcon
                    name={focused ? 'cloud-upload' : 'cloud-upload-outline'}
                    color={color}
                  />
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
                  <TabBarIcon
                    name={focused ? 'musical-notes' : 'musical-notes-outline'}
                    color={color}
                  />
                ),
              }}
              component={RemixListScreen}
            />
          )}
          <Tab.Screen
            name="Winners"
            options={{
              title: 'Winners',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? 'trophy' : 'trophy-outline'}
                  color={color}
                />
              ),
            }}
            component={WinnersScreen}
          />
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
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name="LogIn"
            component={LogIn}
            options={{
              title: 'LOGIN',
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
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
