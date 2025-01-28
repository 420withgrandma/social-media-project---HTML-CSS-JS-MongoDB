// In this seciton the function to show the login and register forms is created
function showForms() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('lrpage').classList.remove('hidden');
}

// In this section the function to go back to the homepage is created
function goBack() {
    document.getElementById('lrpage').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
}

// In this section the function to login is created
async function login() {
    const username = document.getElementById('lusername').value;
    const password = document.getElementById('lpassword').value;

    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            localStorage.setItem("username", username); 
            
            // Show the navigation bar
            document.getElementById('nnbar').classList.remove('hidden');
            
            // Redirect to the post creation page
            showPostPage(); 
        } else {
            alert(result.error || "Failed to login.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
    }
}

// In this section the function to register is created
async function register() {
    const email = document.getElementById('remail').value;
    const username = document.getElementById('rusername').value;
    const password = document.getElementById('rpassword').value;
    const confirmPassword = document.getElementById('rrpassword').value;

    if (!email || !username || !password || !confirmPassword) {
        alert("Please fill in all the fields!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            toggleForms('login'); 
        } else {
            alert(result.error || "Failed to register.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred. Please try again.");
    }
}

// In this section the function to toggle between login and registration forms is created
function toggleForms(form) {
    if (form === 'login') {
        document.getElementById('loginform').classList.add('active');
        document.getElementById('registerform').classList.remove('active');
    } else {
        document.getElementById('registerform').classList.add('active');
        document.getElementById('loginform').classList.remove('active');
    }
}

// In this section the function to show the post creation page is created
function showPostPage() {
    document.getElementById('lrpage').classList.add('hidden');
    document.getElementById('postpage').classList.remove('hidden');
}

// In this section the function to create a post is created
async function createPost() {
    const username = localStorage.getItem("username");
    const content = document.getElementById('postContent').value;

    if (!content) {
        alert("Please enter some content!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, content }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            document.getElementById('postContent').value = ""; 
        } else {
            alert(result.error || "Failed to create post.");
        }
    } catch (error) {
        console.error("Error creating post:", error);
    }
}

// In this section the function to fetch all posts is created
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:8080/posts');
        const posts = await response.json();

        if (response.ok) {
            const postsContainer = document.getElementById('posts');
            postsContainer.innerHTML = posts.map(post => `
                <div class="post">
                    <h4>${post.username}</h4>
                    <p>${post.content}</p>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                </div>
            `).join('');

            document.getElementById('postContainer').classList.remove('hidden');
            document.getElementById('postpage').classList.add('hidden');
        } else {
            alert("No posts available.");
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        alert("Failed to fetch posts. Please try again later.");
    }
}

// In this section the function to show the profile page is created
function showProfilePage() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('lrpage').classList.add('hidden');
    document.getElementById('postpage').classList.add('hidden');
    document.getElementById('postContainer').classList.add('hidden');
    document.getElementById('searchPage').classList.add('hidden');
    document.getElementById('profilePage').classList.remove('hidden');
    fetchUserProfile();
}

// In this section the function to fetch the users profile is created
async function fetchUserProfile() {
    const username = localStorage.getItem("username");

    try {
        const response = await fetch(`http://localhost:8080/users/${username}`);

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error("Error fetching profile:", errorText);
            alert("Failed to fetch profile details. Please try again.");
            return;
        }

        const user = await response.json();

        document.getElementById('profileDetails').innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Followers:</strong> ${user.followers?.length || 0}</p>
            <p><strong>Following:</strong> ${user.following?.length || 0}</p>
        `;
    } catch (error) {
        console.error("Error fetching profile details:", error);
        alert("An error occurred while fetching profile details. Please try again.");
    }
}

// In this section the function to delete a user account is created
async function deleteAccount() {
    const username = localStorage.getItem("username");

    if (!username) {
        alert("You need to be logged in to delete your account!");
        return;
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert("Account deleted successfully!");
            localStorage.removeItem("username");
            document.getElementById('profilePage').classList.add('hidden');
            document.getElementById('homepage').classList.remove('hidden');
        } else {
            const result = await response.json();
            alert(result.error || "Failed to delete account.");
        }
    } catch (error) {
        console.error("Error deleting account:", error);
        alert("An error occurred. Please try again.");
    }
}

// In this section the function to go back to the post page from the search page is created
function goBackToPostPageFromSearch() {
    document.getElementById('searchPage').classList.add('hidden');
    document.getElementById('postpage').classList.remove('hidden');
}

// In this section the function to go back to the posts page from the profile page is created
function goBackToPosts() {
    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('postpage').classList.remove('hidden');
    document.getElementById('postContainer').classList.add('hidden'); 
    document.getElementById('searchPage').classList.add('hidden');   
}

// In this section the function to go back to the post page from all posts page is created
function goBackToPostPage() {
    document.getElementById('postContainer').classList.add('hidden');
    document.getElementById('postpage').classList.remove('hidden');
    document.getElementById('profilePage').classList.add('hidden'); // Ensure profile page is hidden
    document.getElementById('searchPage').classList.add('hidden');  // Ensure search page is hidden
}

// In this section the function to search is created
async function search() {
    const searchQuery = document.getElementById('searchQuery').value;

    if (!searchQuery) {
        alert("Please enter a search term!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = `
            <h3>Users</h3>
            ${results.users.map(user => `<p>${user.username}</p>`).join('')}
            <h3>Posts</h3>
            ${results.posts.map(post => `
                <div class="post">
                    <h4>${post.username}</h4>
                    <p>${post.content}</p>
                </div>
            `).join('')}
        `;

        document.getElementById('searchPage').classList.remove('hidden');
        document.getElementById('postpage').classList.add('hidden');
    } catch (error) {
        console.error("Error during search:", error);
        alert("Failed to perform search. Please try again later.");
    }
}

// In this section the function to log out the user is created
function logout() {
    if (!confirm("Are you sure you want to log out?")) {
        return;
    }

    localStorage.removeItem("username"); 
    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
    alert("You have successfully logged out.");
}

// In this section the function to follow a user is created
async function followUser() {
    const usernameToFollow = document.getElementById("followUsername").value.trim();
    const currentUsername = localStorage.getItem("username");

    if (!usernameToFollow) {
        alert("Please enter a username to follow.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/users/${usernameToFollow}/follow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUsername }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message || `You are now following ${usernameToFollow}`);
            fetchUserProfile(); 
        } else {
            alert(result.error || "Failed to follow user.");
        }
    } catch (error) {
        console.error("Error following user:", error);
        alert("An error occurred. Please try again.");
    }
}

//In this section the function to unfollow a user is created
async function unfollowUser() {
    const usernameToUnfollow = document.getElementById("unfollowUsername").value.trim();
    const currentUsername = localStorage.getItem("username");

    if (!usernameToUnfollow) {
        alert("Please enter a username to unfollow.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/users/${usernameToUnfollow}/unfollow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUsername }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message || `You have unfollowed ${usernameToUnfollow}`);
            fetchUserProfile(); 
        } else {
            alert(result.error || "Failed to unfollow user.");
        }
    } catch (error) {
        console.error("Error unfollowing user:", error);
        alert("An error occurred. Please try again.");
    }
}

//In this section the function to load the users profile is created
async function fetchUserProfile() {
    const username = localStorage.getItem("username");

    try {
        const response = await fetch(`http://localhost:8080/users/${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();
        console.log("User profile fetched:", user);

        document.getElementById('profileDetails').innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Followers:</strong> ${user.followers.length}</p>
            <p><strong>Following:</strong> ${user.following.length}</p>
        `;
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

//In this section the function to load the users followed profiles is loaded
async function showFollowing() {
    const username = localStorage.getItem("username");

    try {
        const response = await fetch(`http://localhost:8080/users/${username}/following`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Following list fetched:", data);

        const followingContainer = document.getElementById('followingList');
        followingContainer.innerHTML = data.following.map(user => `<p>${user}</p>`).join('');
    } catch (error) {
        console.error("Error fetching following list:", error);
    }
}

// In this section the function to upload an image is created. I was not able to get this section working
//async function uploadImage() {
    //const username = localStorage.getItem("username"); 
    //const imageInput = document.getElementById("imageInput");

    //if (!username) {
        //alert("You must be logged in to upload an image.");
        //return;
    //}

    //if (imageInput.files.length === 0) {
        //alert("Please select an image to upload.");
        //return;
    //}

    //const formData = new FormData();
    //formData.append("image", imageInput.files[0]);
    //formData.append("username", username); 

    //try {
        //const response = await fetch("http://localhost:8080/upload", {
            //method: "POST",
           // body: formData,
        //});

        //if (!response.ok) {
            //const errorText = await response.text();
            //console.error("Error uploading image:", errorText);
            //alert("Failed to upload the image.");
            //return;
        //}

        //const result = await response.json();
        //alert(result.message || "Image uploaded successfully!");
    //} catch (error) {
        //console.error("Error uploading image:", error);
        //alert("An error occurred while uploading the image. Please try again.");
    //}
//}

