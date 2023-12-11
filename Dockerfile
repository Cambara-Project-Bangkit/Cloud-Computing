FROM node:18-slim

# create a working directory
WORKDIR /app

# install the dependencies
COPY package*.json ./

# run npm update
RUN npm update

# run npm install
RUN npm install 

# copy the application code
COPY . .

# execute the npm start command
CMD [ "npm", "run", "start" ]