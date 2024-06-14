import { useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as FileSystem from 'expo-file-system';

function SubmissionScreen({ navigation }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileUri, setFileUri] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const storage = getStorage();
    const firestore = getFirestore();
    const auth = getAuth();

    useFocusEffect(
        useCallback(() => {
            setTitle('');
            setDescription('');
            setFileUri(null);
            setImageUri(null);
            setLoading(false);
        }, [])
    );

    const handleTitleChange = text => {
        setTitle(text);
        console.log("Updated Title: ", text);
    };

    const handleDescriptionChange = text => {
        setDescription(text);
        console.log("Updated Description: ", text);
    };

    const pickFile = async (audio) => {
        let mediaType;
        mediaType = ImagePicker.MediaTypeOptions.Audio;

        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
        });

        console.log("Picker result: ", result);

        if (!result.canceled) {
            const fileUri = result.assets[0].uri;
            setFileUri(fileUri);
            console.log("File URI set to: ", fileUri);
        } else {
            console.log("No file was selected");
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log("Picker result: ", result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedImageUri = result.assets[0].uri;
            setImageUri(selectedImageUri);
            console.log("Image URI set to: ", selectedImageUri);
        } else {
            console.log("No image was selected");
        }
    };


    const submitEntry = async () => {
        console.log("Submitting with: ", { title, description, fileUri, imageUri });
        if (!fileUri || !title || !description) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            setLoading(true);
            const userId = auth.currentUser.uid;

            // Upload the remix file
            const fileName = fileUri.split('/').pop();
            const storageRef = ref(storage, `submissions/${fileName}`);
            const response = await fetch(fileUri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            const fileUrl = await getDownloadURL(storageRef);

            // Upload the image file
            let imageUrl = null;
            if (imageUri) {
                const imageName = imageUri.split('/').pop();
                const imageRef = ref(storage, `covers/${imageName}`);
                const imageResponse = await fetch(imageUri);
                const imageBlob = await imageResponse.blob();
                await uploadBytes(imageRef, imageBlob);
                imageUrl = await getDownloadURL(imageRef);
            }

            // Add submission to Firestore
            await addDoc(collection(firestore, `submissions/`), {
                userId,
                title,
                description,
                fileUrl,
                coverUrl: imageUrl,
                timestamp: new Date(),
                status: 'pending'
            });

            setLoading(false);
            Alert.alert('Success', 'Submission uploaded successfully');
            navigation.navigate('HomeScreen');

        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />
            <Button title="Pick a remix" onPress={pickFile} />
            {fileUri ? <Text>File selected: {fileUri.split('/').pop()}</Text> : <Text>No file selected.</Text>}

            <Button title="Pick an album cover" onPress={pickImage} />
            {imageUri ? <Text>Image selected: {imageUri.split('/').pop()}</Text> : <Text>No image selected.</Text>}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Submit" onPress={submitEntry} disabled={loading} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        marginTop: 100,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        padding: 10
    },
    image: {
        width: '100%',
        height: 350,
        marginVertical: 10
    },
});

export default SubmissionScreen;
