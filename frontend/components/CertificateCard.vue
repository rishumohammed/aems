<template>
  <v-card class="certificate-card pa-12 rounded-xl border-lg position-relative overflow-hidden" elevation="0" id="certificate-print-area">
    <!-- Border Design -->
    <div class="cert-border"></div>
    
    <div class="text-center position-relative z-1">
      <div class="d-flex align-center justify-center mb-8">
        <v-icon color="primary" size="48" class="mr-3">mdi-rhombus-split</v-icon>
        <span class="text-h4 font-weight-black tracking-tight">AEMS ACADEMY</span>
      </div>
      
      <div class="text-h5 font-weight-medium text-grey-darken-1 mb-2 tracking-widest uppercase">Certificate of Completion</div>
      <v-divider class="mx-auto mb-8" width="100" thickness="2" color="primary"></v-divider>
      
      <div class="text-body-1 mb-2">This is to certify that</div>
      <div class="text-h3 font-weight-black mb-6 text-primary">{{ cert.student_name }}</div>
      
      <div class="text-body-1 mb-2">has successfully completed the course</div>
      <div class="text-h4 font-weight-bold mb-10">{{ cert.course_name }}</div>
      
      <v-row class="mt-8 align-end">
        <v-col cols="4" class="text-left">
          <div class="text-caption text-grey font-weight-bold uppercase">Issued On</div>
          <div class="text-body-1 font-weight-bold">{{ new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</div>
        </v-col>
        
        <v-col cols="4" class="text-center">
            <div class="qr-container d-inline-block pa-2 bg-white rounded-lg border">
                <qrcode-vue :value="verificationUrl" :size="80" level="H" />
            </div>
            <div class="text-xxs text-grey mt-2">Scan to verify</div>
        </v-col>
        
        <v-col cols="4" class="text-right">
          <div class="text-caption text-grey font-weight-bold uppercase">Certificate ID</div>
          <div class="text-body-1 font-weight-bold font-mono">{{ cert.cert_number }}</div>
        </v-col>
      </v-row>
      
      <div class="mt-12 d-flex justify-center align-center">
        <div class="text-center mx-10">
            <v-img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.svg" width="120" class="mx-auto mb-1"></v-img>
            <v-divider class="mb-1"></v-divider>
            <div class="text-caption font-weight-bold">Academic Director</div>
        </div>
      </div>
    </div>
    
    <!-- Status Watermark -->
    <div v-if="cert.status === 'revoked'" class="revoked-watermark">
        REVOKED
    </div>
  </v-card>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  cert: {
    type: Object,
    required: true
  }
})

const verificationUrl = computed(() => {
    if (process.client) {
        return `${window.location.origin}/verify?id=${props.cert.cert_number}`
    }
    return ''
})
</script>

<style scoped>
.certificate-card {
  background: #fff;
  border: 2px solid #E5E7EB !important;
  min-height: 600px;
  max-width: 900px;
  margin: 0 auto;
}

.cert-border {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border: 1px solid rgba(0, 122, 255, 0.2);
  pointer-events: none;
}

.cert-border::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 3px double rgba(0, 122, 255, 0.1);
}

.tracking-widest { letter-spacing: 0.2em; }
.uppercase { text-transform: uppercase; }
.font-mono { font-family: monospace; }
.text-xxs { font-size: 10px; }

.revoked-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 120px;
    font-weight: 900;
    color: rgba(255, 59, 48, 0.1);
    border: 15px solid rgba(255, 59, 48, 0.1);
    padding: 20px 60px;
    pointer-events: none;
    z-index: 0;
}

@media print {
  body * {
    visibility: hidden;
  }
  #certificate-print-area, #certificate-print-area * {
    visibility: visible;
  }
  #certificate-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none !important;
  }
  .v-btn { display: none !important; }
}
</style>
