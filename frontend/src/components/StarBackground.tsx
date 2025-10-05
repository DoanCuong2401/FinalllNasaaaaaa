import { useEffect, useRef } from "react";

export default function StarBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5,   
                speed: Math.random() * 0.7 + 0.2, 
                opacity: Math.random()
            });
        }

        function drawStars() {
            if (!ctx) return;

            
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);

           
            stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();

                
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

  
                star.opacity += Math.random() * 0.05 - 0.025;
                if (star.opacity < 0.2) star.opacity = 0.2;
                if (star.opacity > 1) star.opacity = 1;
            });

            requestAnimationFrame(drawStars);
        }
        drawStars();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full -z-10 bg-black"
        />
    );
}
