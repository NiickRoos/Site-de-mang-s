import axios from 'axios'

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL
})
//Nós vamos criar um middleware para adicionar o token na requisição

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem("token")
    if(token)
        config.headers!.Authorization = `Bearer ${token}`
    return config
})

//Redirecionar para o LOGIN quando o usuário não tiver permissão.
api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error?.code==="ERR_NETWORK"){
            window.location.href=`/error?mensagem=${encodeURIComponent("Ligue o Servidor-> NPM RUN DEV")}`
        }
        const status = error?.response?.status;
        if(status===401&&!(error?.response?.config?.url.includes("/login"))){
            localStorage.removeItem("token")
            window.location.href=`/login?mensagem=${encodeURIComponent("Token inválido")}`
        }
        return Promise.reject(error)
    }
)



export default api