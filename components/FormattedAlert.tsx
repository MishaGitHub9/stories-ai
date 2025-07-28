import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface FormattedAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

// Component to render formatted text
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <Text style={styles.messageText}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          const boldText = part.slice(2, -2);
          return (
            <Text key={index} style={styles.boldText}>
              {boldText}
            </Text>
          );
        }
        // Regular text
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

export const FormattedAlert: React.FC<FormattedAlertProps> = ({
  visible,
  title,
  message,
  onClose
}) => {
  const colorScheme = useColorScheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertContainer,
          { backgroundColor: Colors[colorScheme ?? 'light'].background }
        ]}>
          <Text style={[
            styles.title,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            {title}
          </Text>
          
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <FormattedText text={message} />
          </ScrollView>
          
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme ?? 'light'].primaryPurple }
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    maxHeight: height * 0.7, // Обмежуємо висоту до 70% екрану
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContainer: {
    width: '100%',
    maxHeight: 200, // Фіксована максимальна висота для тексту
  },
  scrollContent: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  boldText: {
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 