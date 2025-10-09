import { useEffect, useState } from "react";

export function useFetch(url: string, options = {}){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isActive = true;
        ( async () => {
            try{
                const response = await fetch(url, options);
                const json = await response.json();
                if(isActive){setData(json)}
            } catch (err: any){
                setError(err);
            } finally{ 
                setLoading(false);
            }
        })
        return () => {isActive = false;}
    }, [url]);

    return {data, loading, error};
}