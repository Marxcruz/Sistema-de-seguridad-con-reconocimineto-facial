// Función para generar sonido de notificación sin archivo MP3
function playNotificationBeep() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear oscilador para el tono
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el sonido (tono agradable)
    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine'; // Tipo de onda
    
    // Configurar volumen con fade out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Reproducir
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    return true;
  } catch (error) {
    console.log('No se pudo reproducir sonido:', error);
    return false;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.playNotificationBeep = playNotificationBeep;
}
