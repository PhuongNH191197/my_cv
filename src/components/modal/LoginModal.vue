<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false } // v-model
})
const emit = defineEmits(['update:modelValue', 'submit'])

const username = ref('')
const password = ref('')
const remember = ref(true)
const loading  = ref(false)
const err      = ref('')

const unameEl = ref(null)
const pwdEl   = ref(null)

// idle | username | password
const focusArea = ref('idle')

function close(){ emit('update:modelValue', false) }

async function submitForm(){
  err.value = ''
  if (!username.value || !password.value) {
    err.value = 'Vui lòng nhập Username và Password.'
    return
  }
  loading.value = true
  try{
    emit('submit', { username: username.value.trim(), password: password.value, remember: remember.value })
    // close()
  }catch(e){
    err.value = e?.message || 'Đăng nhập thất bại.'
  }finally{
    loading.value = false
  }
}
function onEsc(e){ if (e.key === 'Escape') close() }
onMounted(()=> document.addEventListener('keydown', onEsc))
onBeforeUnmount(()=> document.removeEventListener('keydown', onEsc))

function onFocus(which){ focusArea.value = which }
function onBlur(){
  const active = document.activeElement
  if (active !== unameEl.value && active !== pwdEl.value) focusArea.value = 'idle'
}

/* === Styles động cho mắt/tay (port từ script.js) === */
const eyeLStyle = computed(() =>
    focusArea.value === 'username' ? { left:'0.75em', top:'1.12em' } : { left:'0.6em', top:'0.6em' }
)
const eyeRStyle = computed(() =>
    focusArea.value === 'username' ? { right:'0.75em', top:'1.12em' } : { right:'0.6em', top:'0.6em' }
)
const handLStyle = computed(() =>
    focusArea.value === 'password'
        ? { height:'6.56em', top:'3.87em', left:'11.75em', transform:'rotate(-155deg)' }
        : { height:'2.81em', top:'8.4em',  left:'7.5em',   transform:'rotate(0deg)' }
)
const handRStyle = computed(() =>
    focusArea.value === 'password'
        ? { height:'6.56em', top:'3.87em', right:'11.75em', transform:'rotate(155deg)' }
        : { height:'2.81em', top:'8.4em',  right:'7.5em',   transform:'rotate(0deg)' }
)
</script>

<template>
  <transition name="panda-fade">
    <div v-if="modelValue" class="panda-overlay" @click.self="close" role="dialog" aria-modal="true" aria-label="Login">
      <!-- modal trong suốt, chỉ hiển thị khối vàng -->
      <div class="panda-modal">
        <div class="panda-wrap">
          <!-- Nút đóng bám theo khối vàng -->
          <button class="panda-close" @click="close" aria-label="Close">✕</button>

          <!-- Khối vàng + panda + form -->
          <div class="panda-container">
            <!-- Form -->
            <form class="panda-form" @submit.prevent="submitForm" autocomplete="on">
              <label for="panda-username">Username:</label>
              <input
                  id="panda-username"
                  ref="unameEl"
                  type="text"
                  placeholder="Username here..."
                  v-model.trim="username"
                  @focus="onFocus('username')"
                  @blur="onBlur"
                  autocomplete="username"
                  required
              /><br />
              <label for="panda-password">Password:</label>
              <input
                  id="panda-password"
                  ref="pwdEl"
                  type="password"
                  placeholder="Password here..."
                  v-model="password"
                  @focus="onFocus('password')"
                  @blur="onBlur"
                  autocomplete="current-password"
                  required
              /><br />

              <button class="panda-login-btn" :disabled="loading">
                <i v-if="!loading" class="fa-solid fa-right-to-bracket"></i>
                <i v-else class="fa-solid fa-spinner fa-spin"></i>
                <span>Login</span>
              </button>

              <p v-if="err" class="panda-error">
                <i class="fa-solid fa-triangle-exclamation"></i> {{ err }}
              </p>
            </form>

            <!-- Panda parts -->
            <div class="panda-ear-l"></div>
            <div class="panda-ear-r"></div>
            <div class="panda-face">
              <div class="panda-blush-l"></div>
              <div class="panda-blush-r"></div>
              <div class="panda-eye-l">
                <div class="panda-eyeball-l" :style="eyeLStyle"></div>
              </div>
              <div class="panda-eye-r">
                <div class="panda-eyeball-r" :style="eyeRStyle"></div>
              </div>
              <div class="panda-nose"></div>
              <div class="panda-mouth"></div>
            </div>
            <div class="panda-hand-l" :style="handLStyle"></div>
            <div class="panda-hand-r" :style="handRStyle"></div>
            <div class="panda-paw-l"></div>
            <div class="panda-paw-r"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

/* ==== Overlay mờ phía sau ==== */
.panda-overlay{
  position: fixed; inset: 0; z-index: 2600;
  background: rgba(0,0,0,.65);
  display:flex; align-items:center; justify-content:center;
  padding: 16px;
}

/* ==== Modal trong suốt (không còn khung đen) ==== */
.panda-modal{
  background: transparent; border: 0; box-shadow: none;
  width: auto; height: auto; display:flex; align-items:center; justify-content:center;
}

/* Gói quanh khối vàng để đặt nút Close theo nó */
.panda-wrap{ position: relative; display:inline-block }

/* Nút đóng bám góc khối vàng */
.panda-close{
  z-index: 9999;
  position:absolute; top: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(0,0,0,.65); color:#fff; border:1px solid rgba(255,255,255,.25);
  font-size: 16px; line-height: 1; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:center;
}

/* ======== Khối vàng gốc ======== */
.panda-container{
  position: relative;
  height: 31.25em; width: 31.25em;
  background-color: #22d3ee;;
  border-radius: 12px;
  box-shadow: 0 25px 60px rgba(0,0,0,.45); /* đổ bóng nhẹ để nổi lên overlay */
  overflow: hidden;
  font-family: "Poppins", sans-serif;
}

/* Form */
.panda-form{
  width: 23.75em; height: 18.75em; background-color: #ffffff;
  position: absolute; transform: translate(-50%, -50%);
  top: calc(50% + 3.1em); left: 50%;
  padding: 0 3.1em; display:flex; flex-direction:column; justify-content:center;
  border-radius: 8px;
}
.panda-form label{ display:block; margin-bottom:.2em; font-weight:600; color:#2e0d30 }
.panda-form input{
  font-size:.95em; font-weight:400; color:#3f3554;
  padding:.3em; border:0; border-bottom:.12em solid #3f3554; outline:none;
}
.panda-form input:focus{ border-color:#f4c531 }
.panda-form input:not(:last-child){ margin-bottom:.9em }

/* remember + nút */
.panda-remember{ display:flex; align-items:center; gap:.45rem; margin-top:.25rem; color:#2e0d30 }
.panda-login-btn{
  font-size:.95em; padding:.8em 0; border-radius:2em; border:0; outline:0;
  background:#22d3ee; color:#2e0d30; text-transform:uppercase; font-weight:600; letter-spacing:.15em;
  margin-top:.8em; cursor:pointer; display:inline-flex; align-items:center; gap:.5rem; justify-content:center;
}
.panda-login-btn[disabled]{ opacity:.7; cursor:not-allowed }
.panda-error{
  margin-top:.5rem; background:#7f1d1d; color:#fecaca; border:1px solid #ef4444aa;
  padding:.5rem .6rem; border-radius:8px; display:flex; align-items:center; gap:.5rem;
}

/* Panda parts (namespace .panda-*) */
.panda-face{
  height: 7.5em; width: 8.4em; background:#fff;
  border:.18em solid #2e0d30; border-radius:7.5em 7.5em 5.62em 5.62em;
  position:absolute; top:2em; margin:auto; left:0; right:0;
}
.panda-ear-l, .panda-ear-r{
  background:#3f3554; height:2.5em; width:2.81em;
  border:.18em solid #2e0d30; border-radius:2.5em 2.5em 0 0;
  top:1.75em; position:absolute;
}
.panda-ear-l{ transform:rotate(-38deg); left:10.75em }
.panda-ear-r{ transform:rotate(38deg);  right:10.75em }

.panda-blush-l, .panda-blush-r{
  background:#ff8bb1; height:1em; width:1.37em; border-radius:50%;
  position:absolute; top:4em;
}
.panda-blush-l{ transform:rotate(25deg);  left:1em }
.panda-blush-r{ transform:rotate(-25deg); right:1em }

.panda-eye-l, .panda-eye-r{
  background:#3f3554; height:2.18em; width:2em; border-radius:2em;
  position:absolute; top:2.18em;
}
.panda-eye-l{ left:1.37em;  transform:rotate(-20deg) }
.panda-eye-r{ right:1.37em; transform:rotate(20deg)  }
.panda-eyeball-l, .panda-eyeball-r{
  height:.6em; width:.6em; background:#fff; border-radius:50%;
  position:absolute; transition:1s all;
}
.panda-eyeball-l{ left:.6em;  top:.6em;  transform:rotate(20deg) }
.panda-eyeball-r{ right:.6em; top:.6em;  transform:rotate(-20deg) }

.panda-nose{
  height:1em; width:1em; background:#3f3554; position:absolute; top:4.37em; margin:auto; left:0; right:0;
  border-radius:1.2em 0 0 .25em; transform:rotate(45deg)
}
.panda-nose:before{
  content:""; position:absolute; background:#3f3554; height:.6em; width:.1em;
  transform:rotate(-45deg); top:.75em; left:1em;
}
.panda-mouth, .panda-mouth:before{
  height:.75em; width:.93em; background:transparent; position:absolute; border-radius:50%; box-shadow:0 .18em #3f3554;
}
.panda-mouth{ top:5.31em; left:3.12em }
.panda-mouth:before{ content:""; left:.87em }

.panda-hand-l, .panda-hand-r{
  background:#3f3554; height:2.81em; width:2.5em; border:.18em solid #2e0d30; border-radius:.6em .6em 2.18em 2.18em;
  transition:1s all; position:absolute; top:8.4em;
}
.panda-hand-l{ left:7.5em }
.panda-hand-r{ right:7.5em }

.panda-paw-l, .panda-paw-r{
  background:#3f3554; height:3.12em; width:3.12em; border:.18em solid #2e0d30; border-radius:2.5em 2.5em 1.2em 1.2em;
  position:absolute; top:26.56em;
}
.panda-paw-l{ left:10em }
.panda-paw-r{ right:10em }
.panda-paw-l:before, .panda-paw-r:before{
  position:absolute; content:""; background:#fff; height:1.37em; width:1.75em; top:1.12em; left:.55em;
  border-radius:1.56em 1.56em .6em .6em;
}
.panda-paw-l:after, .panda-paw-r:after{
  position:absolute; content:""; background:#fff; height:.5em; width:.5em; border-radius:50%;
  top:.31em; left:1.12em; box-shadow:.87em .37em #fff, -.87em .37em #fff;
}

/* Responsive */
@media (max-width: 500px){
  .panda-container{ width: 100%; height:31.25em; }
}

/* Transition */
.panda-fade-enter-active, .panda-fade-leave-active{ transition: opacity .18s ease }
.panda-fade-enter-from, .panda-fade-leave-to{ opacity: 0 }
</style>
