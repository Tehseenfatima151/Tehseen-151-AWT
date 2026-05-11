export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDLYJ1l3XpnijUIDPy3D-TroIUjByFe6oM',
    authDomain: 'trustcircle-a5dbc.firebaseapp.com',
    projectId: 'trustcircle-a5dbc',
    storageBucket: 'trustcircle-a5dbc.firebasestorage.app',
    messagingSenderId: '768487573851',
    appId: '1:768487573851:web:db4dcc9fa7d1ebe445f27e',
    measurementId: 'G-00YWEFV2GR',
  },
  cloudinary: {
    cloudName: 'dwc3vdt2r',
    uploadPreset: 'trustcircle_uploads'
  }
};

export function isFirebaseConfigured(): boolean {
  const k = environment.firebase.apiKey;
  return !!k && !k.includes('YOUR_');
}
