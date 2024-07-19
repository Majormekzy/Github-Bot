# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install
RUN npm cache clean --force

# Copy the rest of the application code to the working directory
COPY . .

# Copy the private key file to the working directory
COPY hng-botapp.2024-07-18.private-key ./private-key.pem

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]

