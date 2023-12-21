# Cloud-Computing

## Deployed API link:
  https://aksara-v4v5u72orq-et.a.run.app/api/

## Project Setup
  ### Install dependencies: 
      npm install
  ### Create Configuration file: 
  #### Example firebase-key.json:
        {
          "type": "service_account",
          "project_id": "name product",
          "private_key_id": "private key id",
          "private_key": "-----BEGIN PRIVATE KEY-----\private key",
          "client_id": "client id gcloud",
          "auth_uri": "https://accounts.google.com/o/oauth2/auth",
          "token_uri": "https://oauth2.googleapis.com/token",
          "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
          "client_x509_cert_url": "url firestore service",
          "universe_domain": "googleapis.com"
       }
     
  #### Example cloud-storage-key.json:
       {
          "type": "service_account",
          "project_id": "name product",
          "private_key_id": "private key id",
          "private_key": "\private key",
          "client_email": "client service account email",
          "client_id": "client id gcloud",
          "auth_uri": "https://accounts.google.com/o/oauth2/auth",
          "token_uri": "https://oauth2.googleapis.com/token",
          "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
          "client_x509_cert_url": "url cloudstorage service",
          "universe_domain": "googleapis.com"
        }
  
  ### Create .env:
      JWT_SECRET= <jwt secret>
      JWT_REFRESH_SECRET= <jwt refesh secret>
      
      PROJECT_ID= <Google Cloud Project ID>
      KEY_FILE= <Google Cloud Service Account Key for Storage Admin Role>
      BUCKET_NAME= <Google Cloud Storage Bucker Name>
      FIREBASE_URL= <Firebase Database URL>
    
  ### Run the server:
      npm run start
      
  ### See the documentation swagger:
      localhost:3000/api-docs

  ### Project Structure: 
      project-root/
      │
      ├── app/
      │ ├── config/
      │ │ ├── firestore.js
      │ │ └── gcs.js
      │ ├── controllers/
      │ │ ├── aksaraController.js
      │ │ ├── authController.js
      │ │ └── uploadController.js
      │ ├── models/
      │ │ ├── aksara.js
      │ │ └── user.js
      │ └── routes/
      │ │ ├── aksaraRoutes.js
      │ │ ├── uploadRoutes.js
      │ │ └── userRoutes.js
      │ ├── cloud-storage-key.json
      │ └── firebase-key.json
      │
      ├── node_modules/
      │
      ├── uploads/
      │
      ├── .env
      ├── .gitignore
      ├── Dockerfile
      ├── package.json
      ├── package-lock.json
      ├── README.md
      └── server.js
      
## Contributors
+ C666BSX4034 – Linda Yanti Yo – STMIK Kharisma Makassar
+ C298BSX3069 – Ni Putu Adinda Indah Juliantari – Universitas Pendidikan Ganesha
