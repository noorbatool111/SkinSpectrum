import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors } from '../../constants/color';
import { Ionicons } from '@expo/vector-icons';

const LocationGrid = ({ items, locVal, setLocVal }) => {
  const renderItem = ({ item }) => {
    const isSelected = locVal === item.value;
    
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          isSelected && styles.itemSelected
        ]}
        onPress={() => setLocVal(item.value)}
      >
        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
          <Ionicons 
            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
            size={20} 
            color={isSelected ? colors.white : colors.primary} 
          />
        </View>
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where is the mole located?</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.value}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textHeading,
    marginBottom: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemContainer: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSub,
    flex: 1,
  },
  itemTextSelected: {
    color: colors.primary,
  },
});

export default LocationGrid;
