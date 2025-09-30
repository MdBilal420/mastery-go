#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Create Expo app
npx create-expo-app -t expo-template-blank-typescript .

# Install dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install expo-av expo-file-system
npm install @reduxjs/toolkit react-redux

echo "Frontend setup complete!"