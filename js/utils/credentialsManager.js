const emailKey = "mailectron-email";
const passwordKey = "mailectron-password";

class CredentialsManager {
    setCredentials(email, password) {
        localStorage.setItem(emailKey, email);
        localStorage.setItem(passwordKey, password);
    }

    getEmail() {
        return localStorage.getItem(emailKey);
    }

    getPassword() {
        return localStorage.getItem(passwordKey);
    }

    getCredentials() {
        return {
            "email" : this.getEmail(),
            "password" : this.getPassword()
        }
    }

    clearCredentials() {
        localStorage.removeItem(emailKey);
        localStorage.removeItem(passwordKey);
    }

    isLoggedIn() {
        let email = localStorage.getItem(emailKey);
        let password = localStorage.getItem(passwordKey)
        
        return email && password;
    }
} 

module.exports = CredentialsManager;