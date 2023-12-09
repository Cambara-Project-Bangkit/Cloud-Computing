FROM node:18-slim

# create a working directory
WORKDIR /usr/src/app

# install the dependencies
COPY package.json package*.json ./

# run npm install
RUN npm install 

# copy the application code
COPY . .

# execute the npm start command
CMD [ "npm", "start" ]