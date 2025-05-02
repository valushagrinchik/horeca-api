import http from 'k6/http';
import { check, sleep } from 'k6';

const URL = "http://localhost:3001"

function generateUserData(role) {
    const email = `${role}${Math.random().toString(36).substring(2, 10)}@example.com`
    return {
        email,
        password: 'password123',
        repeatPassword:  'password123',
        "name": email,
        "tin": "123",
        "phone": "234324234",
        "GDPRApproved": true,
    }
}

function generateHorecaPayload() {
    return JSON.stringify({
        ...generateUserData('horeca'),
        "profile": {
            "profileType": "Horeca",
            "addresses": [{
                "address": "qweqwe",
                "weekdays": ["fr", "mo"],
                "moFrom": "23:00",
                "moTo": "21:50",
                "frFrom": "23:00",
                "frTo": "21:50"
            }]
        }
    });
}


function generateProviderPayload() {
    return JSON.stringify({
        ...generateUserData('provider'),
        "profile": {
            "profileType": "Provider",
            "minOrderAmount": 2300,
            "categories": ["alcoholicDrinks"],
            "deliveryMethods": ["selfPickup"]
        }
      
    });
}


function createUser(payload) {
    const params = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
    
      const res = http.post(URL + '/api/auth/registration', payload, params);
      check(res, {
        'status is 201': (r) => r.status === 201,
      });
    
      return res.json();
}

function createHoreca() {
    const payload = generateHorecaPayload()
    createUser(payload) 
    return payload
}

function createProvider() {
    const payload = generateProviderPayload()
    createUser(payload) 
    return payload
}

function loginUser(payload) {
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    const res = http.post(URL+ '/api/auth/login', payload, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response contains token': (r) => r.body.includes('token'),
    });
  
    return res.json().token; // Возвращаем токен для дальнейших запросов
  }

// Параметры нагрузки
export let options = {
  vus: 100,        // Количество виртуальных пользователей
  duration: '30s',  // Длительность теста
};

export default function () {
    const payload = createHoreca();
  
    // Шаг 2: Логинимся с созданным пользователем
    const token = loginUser({
        email: payload.email,
        password: payload.password
    });
  
    // Шаг 3: Делаем запрос с авторизацией
    const profileRes = http.get(URL+'/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    check(profileRes, {
      'profile is 200': (r) => r.status === 200,
    });
  
    sleep(1);  // Задержка между запросами
}
