import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Keyboard } from 'react-native';
import NutriNode from '../assets/NutriNode.png';
import axios from 'axios';
import Constants from 'expo-constants';
import Voice from '@react-native-voice/voice';

const ChatScreen = () => {
  
  const  {API_KEY}  = Constants.expoConfig.extra;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [firstMessageSent, setFirstMessageSent] = useState(false); // New state variable
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false); // State to track response generation
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  // const OPENAI_API_KEY = ''; set open api key to work
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  useEffect(() => {


    Voice.onSpeechStart = (e) => {
      setErrorMsg('');
      setRecording(true);
    };

    Voice.onSpeechEnd = (e) => {
      setRecording(false);
    };


    Voice.onSpeechError = (e: any) => {
      const errMsg = e.error?.message;

      if (errMsg.includes('No match')) {
        setErrorMsg("You are not speaking!");
      } else {
        setErrorMsg(errMsg);
      }

      setRecording(false);
    }

    Voice.onSpeechResults = (e: any) => {
      const prompt = e.value[0];
      if (!prompt) {
        return;
      }
      setResult(prompt);
    };


    //setMessages(initialMessages);


    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Tts.stop();
    };
  }, []);

// --------------------------------------------------------------------

const analyzeImage = async () => {
  setIsGeneratingResponse(true);
  try {

    console.log('API Key', API_KEY);
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: inputMessage,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    setMessages(prevMessages => [
      ...prevMessages,
      { text: response.data.choices[0].message.content, sender: 'assistant' },
    ]);

   // console.log('headers', headers);
  } catch (error) {
    console.error('Error making API request:', error.response ? error.response.data : error);
  }
  finally {
    setIsGeneratingResponse(false); // Set back to false after response is received
  }
};

const handleMessageSend = () => {
  if (!firstMessageSent) {
    setFirstMessageSent(true);
  }
  if (inputMessage.trim() !== '') {
    setMessages(prevMessages => [
      ...prevMessages,
      { text: inputMessage, sender: 'user' },
    ]);
    setInputMessage('');
    analyzeImage(); // Call analyzeImage function here
  }
};

const startSpeechToText = async () => {
  try {

    setIsListening(true);
    await Voice.start('en-US'); // Start speech recognition
    Voice.onSpeechResults = (event) => {
      setRecognizedText(event.value[0]); // Set recognized text
      setIsListening(false); // Update state after recognition

      if (!firstMessageSent) {
        setFirstMessageSent(true);
      }
      if (inputMessage.trim() !== '') {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: inputMessage, sender: 'user' },
        ]);
        setInputMessage('');
        analyzeImage(); // Call analyzeImage function here
      }

    };
  } catch (error) {
    console.error(error);
  }
};

  return (
    <View style={styles.container}>
      {/* NutriNode virtual assistant */}
      {!firstMessageSent && (
        <Image source={NutriNode} style={styles.image} />
      )}
      <View style={styles.assistantContainer}>
        {!isKeyboardVisible && !firstMessageSent && (
          <Text style={styles.assistantText}>Your virtual nutrition assistant</Text>
        )}
      </View>

      {/* Chat messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageBubble, message.sender === 'user' ? styles.userMessage : styles.assistantMessage]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {isGeneratingResponse && (
          <View style={[styles.assistantMessage, styles.messageBubble]}>
            <Text>Generating response...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          multiline={true}
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleMessageSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.sendButton} onPress={startSpeechToText}>
          <Text style={styles.sendButtonText}>Mike</Text>
        </TouchableOpacity> */}
      </View>

      {/* Additional text below chat box */}
      <Text style={styles.additionalText}>ChatGPT can make mistakes. Consider checking main information</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginTop: 50,
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  assistantContainer: {
    position: 'absolute',
    left: '42%',
    transform: [{ translateX: -50 }],
  },
  assistantText: {
    top: -20,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'gray',
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
  },
  messageBubble: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxWidth: '70%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccc',
  },
  messageText: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 150,
  },
  sendButton: {
    backgroundColor: '#344B3F',
    borderRadius: 25, // Make it a circle
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  additionalText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
