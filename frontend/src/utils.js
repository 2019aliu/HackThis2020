export const credentialValidation = (data) => {
    let message = "";
    let username = data.username;
    let password = data.password;
    if (!username || username.length === 0) {
        message = "Please enter a username"
    } else if (username.length < 3) {
        message = "The username must be at least 3 characters long"
    } else if (! (/^[a-zA-Z0-9]+$/i.test(username)) ) {
        message = "Please enter a username with only numbers (0-9) and letters (a-z) and underscores"
    } else if (!password || password.length === 0) {
        message = "Please enter a password"
    } else if (password.length < 8) {
        message = "The password must be at least 8 characters long"
    }

    return message;
}