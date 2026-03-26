<template>
  <footer class="footer">
    <div class="container" style="padding:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem;">
        <small class="muted">© {{ year }} {{ name }}. All rights reserved.</small>
        <div style="display:flex;gap:.75rem;">
          <a class="btn" :href="links.github" target="_blank" rel="noreferrer">GitHub</a>
          <a class="btn" :href="links.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
const name = 'IamFhug'
const links = {
  github: 'https://github.com/yourname',
  linkedin: 'https://www.linkedin.com/in/yourname/',
}
</script>
