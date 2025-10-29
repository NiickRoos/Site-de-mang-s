import {  useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";

function Login(){
    const [searchParams] = useSearchParams()
    const mensagem = searchParams.get("mensagem") 
    const navigate = useNavigate();
    function handleForm(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const senha = formData.get("senha");
        api.post("/login", {email, senha})
        .then((response:any)=>{
            if(response.status ===200){
                localStorage.setItem('token', response?.data?.token);
                navigate("/dashboard");

            }
        })
        .catch((error:any)=>{
            const msg = error?.response?.data?.mensagem?? error?.mensagem?? "Erro desconhecido";
            navigate(`/login?mensagem=${encodeURIComponent(msg)}`);
        })
    }
    return(
        <>
        {mensagem&&<p>{mensagem}</p>}
            <form onSubmit={handleForm}>
                <input type="text" name="email" placeholder="Email" />
                <input type="password" name="senha" placeholder="Senha" />
                <input type="submit" value="Login" />
            </form>
        
        </>
    )
}
export default Login;