
const getServerUrl = () =>{
  const workingMode = import.meta.env.VITE_WORKING_MODE;
  if(workingMode=='dev'){
    return 'http://localhost:3000';
  }else{
    return 'https://paragraph-mcq-generator-ai.vercel.app';
  }
}

export default getServerUrl;
