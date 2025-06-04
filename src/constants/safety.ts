import { Message } from '../types/safety';

export const INITIAL_MESSAGE: Message = {
  id: '1',
  text: "Hello, I'm your AI Safety Assistant. I'm here to help you with:\n\n• Creating safety plans\n• Finding emergency resources\n• Understanding your rights\n• Connecting with support services\n\nHow can I assist you today?",
  sender: 'assistant',
  timestamp: new Date(),
};

export const EMERGENCY_RESOURCES = `EMERGENCY RESOURCES:

🚨 Police: 10111
🏥 Ambulance: 10177
📞 GBV Command Centre: 0800 428 428

If you're in immediate danger:
1. Call emergency services immediately
2. Try to move to a safe location
3. Make noise to alert neighbors
4. Use your emergency code word if you have one`; 