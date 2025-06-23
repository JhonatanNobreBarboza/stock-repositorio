<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Usuário</label>
          <input v-model="username" type="text" id="username" class="form-input" placeholder="Digite seu usuário"
            required autocomplete="username" />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Senha</label>
          <input v-model="password" type="password" id="password" class="form-input" placeholder="Digite sua senha"
            required autocomplete="current-password" />
        </div>
        <button type="submit" class="login-button">Entrar</button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
          username: this.username,
          password: this.password,
        });
        localStorage.setItem('token', response.data.token);
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = 'Credenciais inválidas';
      }
    },
  },
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #1a202c, #374151);
  color: #1a202c;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 28rem;
  transition: transform 0.3s;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  color: #1e40af;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 90%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2);
}

.login-button {
  background: linear-gradient(to right, #1e40af, #3b82f6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s, transform 0.3s;
}

.login-button:hover {
  background: linear-gradient(to right, #3b82f6, #1e40af);
  transform: translateY(-0.25rem);
}

.error-message {
  margin-top: 1rem;
  text-align: center;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>