import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, Chip, List } from 'react-native-paper';
import * as Location from 'expo-location';

interface Resource {
  id: string;
  name: string;
  type: 'legal' | 'support' | 'emergency';
  description: string;
  phone: string;
  address: string;
  available24h: boolean;
  languages: string[];
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Women\'s Legal Aid Center',
    type: 'legal',
    description: 'Free legal assistance for women experiencing gender-based violence.',
    phone: '1-800-555-0101',
    address: '123 Main Street, City',
    available24h: false,
    languages: ['English', 'Spanish'],
  },
  {
    id: '2',
    name: 'Emergency Support Hotline',
    type: 'emergency',
    description: '24/7 crisis intervention and support services.',
    phone: '1-800-555-0102',
    address: 'Confidential Location',
    available24h: true,
    languages: ['English', 'French', 'Spanish'],
  },
  {
    id: '3',
    name: 'Survivor Support Network',
    type: 'support',
    description: 'Counseling and peer support services for survivors.',
    phone: '1-800-555-0103',
    address: '456 Help Street, City',
    available24h: false,
    languages: ['English', 'Arabic'],
  },
];

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMap = (address: string) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search resources..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {['legal', 'support', 'emergency'].map(type => (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(selectedType === type ? null : type)}
                style={styles.filterChip}
                mode="outlined"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {filteredResources.map(resource => (
        <Card key={resource.id} style={styles.resourceCard}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <Title>{resource.name}</Title>
              {resource.available24h && (
                <Chip mode="outlined" style={styles.chip}>24/7</Chip>
              )}
            </View>
            <Paragraph>{resource.description}</Paragraph>
            
            <View style={styles.languagesContainer}>
              {resource.languages.map(lang => (
                <Chip key={lang} style={styles.languageChip} compact>
                  {lang}
                </Chip>
              ))}
            </View>

            <List.Item
              title={resource.phone}
              left={props => <List.Icon {...props} icon="phone" />}
              onPress={() => handleCall(resource.phone)}
            />
            <List.Item
              title={resource.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
              onPress={() => handleMap(resource.address)}
            />
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  searchCard: {
    margin: 16,
    elevation: 4,
  },
  searchbar: {
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  resourceCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#e8f5e9',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  languageChip: {
    marginRight: 4,
    marginBottom: 4,
  },
}); 