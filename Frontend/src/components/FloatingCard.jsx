function FloatingCard({title, icon, className}){

return(

<div
className={`
${className}
w-40
rounded-2xl
bg-white
p-4
shadow-xl
transition-transform
hover:scale-105
`}
>


<div className="text-4xl text-center">
{icon}
</div>


<h3 className="mt-3 text-center text-sm font-semibold text-gray-800">
{title}
</h3>


</div>

)

}


export default FloatingCard;