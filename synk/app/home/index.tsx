import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function HomeScreen() {

  return (
    <SafeAreaView>
      <ThemedView style={styles.titleContainer}>

        <ThemedText style={styles.header}>
          SynK
        </ThemedText>

        <ThemedText style={styles.titleText}>
          Fresh Remixes
        </ThemedText>

        <ThemedView style={styles.card}>
          <Link href={'./read'} asChild>
            <ThemedText style={styles.cardText}>R&B</ThemedText>
          </Link>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardText}>Hip-Hop</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardText}>House</ThemedText>
        </ThemedView>

      </ThemedView>
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