import AsyncStorage from "@react-native-async-storage/async-storage"

const StorageService = {
    async returnToken(){
        try{
            // A chave que você usa é "@Storage: userToken"
            return await AsyncStorage.getItem("@Storage: token");
        }catch(error){
            console.error("StorageService: erro ao retornar o TOKEN", error);
            return null;
        }
    },
    async returnUserId(){
        try{
            // A chave que você usa é "@Storage: userId"
            return await AsyncStorage.getItem("@Storage: userId");
        }catch(error){
            console.error("StorageService: error ao retornar o ID do usuário", error);
            return null;
        }
    },
    async clearData(){
        try{
            await AsyncStorage.removeItem("@Storage: userToken");
            await AsyncStorage.removeItem("@Storage: userId");
        }catch(error){
            console.error("StorageService: erro ao limpar dados", error);
        }
    },
    async saveToken(token) {
        try{
            await AsyncStorage.setItem("@Storage: userToken", token);
        }catch(error){
            console.error("StorageService: erro ao salvar o TOKEN",error);
        }
    },
    async saveUserId(userId){
        try{
            await AsyncStorage.setItem("@Storage: userId", userId);
        }catch(error){
            console.error("StorageService: erro ao salvar o ID do usuário", error);
        }
    }
}

export default StorageService;