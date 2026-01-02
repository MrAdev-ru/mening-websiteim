// redirect.js
function redirectAfterLogin(username, password) {
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'superadmin', password: 'superadmin123' }
    ];
    
    const isValid = validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
    
    if (isValid) {
        // Use absolute path to ensure correct redirection
        window.location.href = window.location.pathname.replace('Admin.html', '') + 'admin-dashboard.html';
        return true;
    }
    return false;
}