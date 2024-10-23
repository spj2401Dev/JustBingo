<!-- src/routes/Login.svelte -->
<script context="module">
    export const load = async () => {
      return {
        env: {
          username: import.meta.env.VITE_ADMIN_USERNAME,
          password: import.meta.env.VITE_ADMIN_PASSWORD
        }
      };
    };
  </script>
  
  <script>
    export let env;
    let username = "";
    let password = "";
    let errorMessage = "";
    let isAuthenticated = false;
  
    function handleLogin() {
      if (username === env.username && password === env.password) {
        isAuthenticated = true;
      } else {
        errorMessage = "Invalid credentials!";
      }
    }
  </script>
  
  {#if isAuthenticated}
    <script>
      window.location.href = "/admin/configure-words"; // Redirect to the admin page
    </script>
  {:else}
    <div class="login-container">
      <h1>Login</h1>
      <div>
        <label>Username</label>
        <input type="text" bind:value={username} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" bind:value={password} />
      </div>
      <button on:click={handleLogin}>Login</button>
      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}
    </div>
  {/if}
  
  <style>
    .login-container {
      max-width: 300px;
      margin: auto;
      text-align: center;
    }
    .error {
      color: red;
    }
  </style>
  