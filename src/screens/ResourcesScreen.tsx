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
    name: 'GBV Command Centre',
    type: 'emergency',
    description: 'South Africa\'s 24/7 national helpline for victims of gender-based violence. Provides counseling, support and referral services.',
    phone: '0800 428 428',
    address: 'National Service',
    available24h: true,
    languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
  },
  {
    id: '2',
    name: 'POWA (People Opposing Women Abuse)',
    type: 'support',
    description: 'Provides counselling, legal advice, court support and shelter services to women survivors of domestic and sexual violence.',
    phone: '011 642 4345',
    address: '64 Mitchell Street, Berea, Johannesburg',
    available24h: false,
    languages: ['English', 'Zulu', 'Sotho'],
  },
  {
    id: '3',
    name: 'Lawyers Against Abuse (LvA)',
    type: 'legal',
    description: 'Provides free legal services and psychosocial support to victims of gender-based violence.',
    phone: '087 150 7130',
    address: 'Diepsloot, Johannesburg',
    available24h: false,
    languages: ['English', 'Zulu'],
  },
  {
    id: '4',
    name: 'Rape Crisis Cape Town Trust',
    type: 'support',
    description: 'Offers counselling, support, and advocacy for survivors of sexual violence. Provides court support and prevention programs.',
    phone: '021 447 1467',
    address: 'Observatory, Cape Town',
    available24h: false,
    languages: ['English', 'Afrikaans', 'Xhosa'],
  },
  {
    id: '5',
    name: 'SAPS Emergency',
    type: 'emergency',
    description: 'South African Police Service emergency response for immediate danger or crime reporting.',
    phone: '10111',
    address: 'National Service',
    available24h: true,
    languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho'],
  },
  {
    id: '6',
    name: 'Thuthuzela Care Centres',
    type: 'support',
    description: 'One-stop facilities for survivors of sexual violence, providing medical care, counselling, and assistance with case reporting.',
    phone: '012 845 6000',
    address: 'Multiple locations across South Africa',
    available24h: true,
    languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho'],
  },
  {
    id: '7',
    name: 'Legal Aid South Africa',
    type: 'legal',
    description: 'Provides free legal services to those who cannot afford it, including cases of domestic violence and sexual offenses.',
    phone: '0800 110 110',
    address: 'National Service',
    available24h: false,
    languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho'],
  }
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