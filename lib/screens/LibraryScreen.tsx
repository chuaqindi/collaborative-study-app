import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// TODO: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD6LWQtONhuxvUUkBZobZcLhYwy2HAcv1Q';

interface Library {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const LibraryScreen = () => {
  const [postalCode, setPostalCode] = useState<string>('');
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | undefined>(undefined);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to show nearby libraries.');
        // Set a default region (e.g., center of Singapore)
        setRegion({
          latitude: 1.3521,
          longitude: 103.8198,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02, // Zoom level
          longitudeDelta: 0.02, // Zoom level
        });
      } catch (error) {
        console.error("Error getting current location:", error);
        Alert.alert("Error", "Could not fetch current location. Please enter a postal code.");
        // Set a default region if location fails
        setRegion({
          latitude: 1.3521,
          longitude: 103.8198,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    })();
  }, []);

  const fetchNearbyLibraries = async () => {
    if (!postalCode.trim()) {
      Alert.alert('Input needed', 'Please enter a postal code.');
      return;
    }

    setIsLoading(true);
    setLibraries([]);
    console.log(`Searching for libraries near postal code: ${postalCode}`);

    try {
      // 1. Geocode the postal code to get coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${GOOGLE_MAPS_API_KEY}&components=country:SG`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || geocodeData.results.length === 0) {
        throw new Error(geocodeData.error_message || 'Could not find coordinates for the postal code.');
      }

      const location = geocodeData.results[0].geometry.location; // { lat: number, lng: number }
      const { lat, lng } = location;
      console.log(`Coordinates found: Lat: ${lat}, Lng: ${lng}`);

      // Update map region to center on the geocoded location first
      setRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.08, // Zoom level for 7km radius (approx)
          longitudeDelta: 0.08,
        });

      // 2. Use the coordinates to search for nearby libraries (NLB)
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=7000&type=library&keyword=NLB&key=${GOOGLE_MAPS_API_KEY}`;
      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();

      if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
         throw new Error(placesData.error_message || 'Error fetching nearby libraries.');
      }

      if (placesData.results && placesData.results.length > 0) {
          const fetchedLibraries: Library[] = placesData.results.map((place: any) => ({
              id: place.place_id, // Use place_id as unique key
              name: place.name,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
          }));
          setLibraries(fetchedLibraries);
          console.log(`Found ${fetchedLibraries.length} libraries.`);
           // Keep region centered on the geocoded postal code
      } else {
          setLibraries([]);
          Alert.alert('No Libraries Found', 'No NLB libraries found within 7km of this postal code.');
          console.log('No libraries found.');
      }

    } catch (error: any) {
      console.error("Error fetching libraries:", error);
      Alert.alert('Error', `Failed to fetch library data: ${error.message}`);
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Find Nearby Libraries</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Postal Code (e.g., 530000)"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
        />
        <Button title="Search Libraries" onPress={fetchNearbyLibraries} />

        {region ? (
          <MapView style={styles.map} region={region}>
            {libraries.map((library) => (
              <Marker
                key={library.id}
                coordinate={{
                  latitude: library.latitude,
                  longitude: library.longitude,
                }}
                title={library.name}
              />
            ))}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Loading Map...</Text>
        )}
        {isLoading && (
           <View style={styles.loadingOverlay}>
             <ActivityIndicator size="large" color="#0000ff" />
             <Text>Searching for libraries...</Text>
           </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  map: {
    flex: 1,
    marginTop: 15,
  },
   loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  }
});

export default LibraryScreen; 