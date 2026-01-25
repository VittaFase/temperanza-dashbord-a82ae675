import lemonPepperImg from "@/assets/products/lemon-pepper.png";
import papricaPicanteImg from "@/assets/products/paprica-picante.png";
import temperoEduGuedesImg from "@/assets/products/tempero-edu-guedes.png";
import salsaCebolaAlhoImg from "@/assets/products/salsa-cebola-alho.png";
import temperoMineiroImg from "@/assets/products/tempero-mineiro.png";

export interface PostOption {
  id: string;
  caption: string;
  hashtags: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  color: string;
  colorClass: string;
  emojis: string;
  posts: PostOption[];
}

export const products: Product[] = [
  {
    id: "lemon-pepper",
    name: "Lemon Pepper",
    image: lemonPepperImg,
    color: "#4ade80",
    colorClass: "herb-green",
    emojis: "🍋🌶️🌿👨‍🍳🍽️",
    posts: [
      {
        id: "lp-1",
        caption: `🍋 O toque cítrico que faltava na sua cozinha! ✨

O Lemon Pepper Temperanza Gastronomia transforma seus peixes, aves e saladas em verdadeiras obras de arte gastronômica.

Eleve seus pratos a um novo patamar de sabor com a finesse do nosso tempero premium! 

👉 Garanta o seu pelo link na bio!`,
        hashtags: "#TemperanzaGastronomia #LemonPepper #TemperosGourmet #CulinariaComAlma #ChefEmCasa #SaborQueInspira #PeixeNoBrasa #ReceitasDePeixe"
      },
      {
        id: "lp-2",
        caption: `✨ Vibrante. Zesty. Irresistível.

O segredo para um salmão perfeito? Nosso Lemon Pepper artesanal que combina a acidez do limão siciliano com a intensidade da pimenta-do-reino.

🍽️ Experimente em:
• Filés de peixe grelhados
• Frango assado crocante  
• Saladas mediterrâneas

Descubra a arte de temperar! 🌿`,
        hashtags: "#TemperanzaGastronomia #ArteNaCozinha #LemonPepper #ExperienciaGastronomica #SaborVibrante #CozinhaGourmet #TemperosNaturais"
      },
      {
        id: "lp-3",
        caption: `👨‍🍳 O que os grandes chefs têm em comum?

Um tempero que transforma o ordinário em extraordinário!

O Lemon Pepper Temperanza Gastronomia é a escolha dos apaixonados por uma culinária sofisticada e saborosa.

Frescor elegante em cada pitada! 🍋✨

📲 Peça já o seu!`,
        hashtags: "#TemperanzaGastronomia #TemperosGourmet #ChefEmCasa #GastronomiaEmCasa #LemonPepper #SaborPremium #CozinhaDeChef"
      }
    ]
  },
  {
    id: "paprica-picante",
    name: "Páprica Picante",
    image: papricaPicanteImg,
    color: "#ef4444",
    colorClass: "spice-red",
    emojis: "🌶️🔥🍷🥩🎨",
    posts: [
      {
        id: "pp-1",
        caption: `🔥 Desperte os sentidos com o calor perfeito!

A Páprica Picante Temperanza Gastronomia traz profundidade de sabor, cor vibrante e aquele ardor equilibrado que você ama.

Perfeita para:
• Carnes vermelhas suculentas
• Ensopados elaborados
• Legumes assados

Uma experiência culinária inesquecível! 🌶️`,
        hashtags: "#TemperanzaGastronomia #PapricaPicante #SaborQueInspira #CarneVermelha #TemperosGourmet #CulinariaComPaixao #PimentaComSabor"
      },
      {
        id: "pp-2",
        caption: `🎨 Cor, sabor e intensidade em um único tempero!

Nossa Páprica Picante não é apenas um tempero - é uma declaração de amor à culinária autêntica.

O segredo das receitas que marcam a memória está aqui! ✨

🔥 Ardente na medida certa
❤️ Sabor profundo e marcante
🍷 Perfeita com vinhos encorpados

Adicione à sua coleção!`,
        hashtags: "#TemperanzaGastronomia #Paprica #GastronomiaArtesanal #SaborIntensidade #ReceitasTemperanza #CozinhaAutentica #TemperosEspeciais"
      },
      {
        id: "pp-3",
        caption: `🥩 A diferença entre uma refeição comum e uma experiência gastronômica?

A Páprica Picante Temperanza Gastronomia.

Cada grão carrega a tradição de séculos de culinária refinada, trazendo para sua cozinha o exótico e o familiar em perfeita harmonia.

🌶️ Experimente hoje!`,
        hashtags: "#TemperanzaGastronomia #PapricaPicante #ExperienciaGastronomica #CarnesNobres #TemperosArtesanais #SaborMarcante #ChurrascoPremium"
      }
    ]
  },
  {
    id: "tempero-edu-guedes",
    name: "Tempero Edu Guedes",
    image: temperoEduGuedesImg,
    color: "#a78bfa",
    colorClass: "primary",
    emojis: "👨‍🍳🧂🍲✅🌟",
    posts: [
      {
        id: "teg-1",
        caption: `🧑‍🍳 O segredo dos grandes chefs na sua cozinha!

O Tempero Edu Guedes Temperanza Gastronomia foi criado para quem busca praticidade sem abrir mão da excelência.

Completo, versátil e delicioso!

✅ Perfeito para carnes
✅ Ideal para frangos
✅ Transforma legumes

Garanta o seu toque de mestre! 🌟`,
        hashtags: "#TemperanzaGastronomia #EduGuedes #ReceitaDeChef #CozinhaDescomplicada #TemperosGourmet #SaborAutentico #ChefEmCasa"
      },
      {
        id: "teg-2",
        caption: `✨ Cozinhar como um chef nunca foi tão fácil!

O Tempero Edu Guedes traz para sua mesa o sabor que você vê nos melhores programas de culinária.

Uma combinação perfeita de especiarias selecionadas que garantem pratos extraordinários todos os dias.

👨‍🍳 Aprovado pelo chef, perfeito para você!`,
        hashtags: "#TemperanzaGastronomia #EduGuedes #CulinariaBrasileira #TemperosCompletos #SaborDeMestre #ReceitasFaceis #GastronomiaEmCasa"
      },
      {
        id: "teg-3",
        caption: `🍲 Transforme o dia a dia em uma experiência gourmet!

O Tempero Edu Guedes Temperanza Gastronomia é sua chave para pratos perfeitos - do mais simples ao mais elaborado.

💡 Dica: experimente no arroz, no feijão, nas carnes grelhadas... Em tudo!

O mestre-cuca que faltava na sua cozinha! 🧂`,
        hashtags: "#TemperanzaGastronomia #EduGuedes #DicasDeCozinha #TemperosVersateis #CozinhaDoDiaDia #SaborProfissional #ReceitasTemperanza"
      }
    ]
  },
  {
    id: "salsa-cebola-alho",
    name: "Salsa Cebola e Alho",
    image: salsaCebolaAlhoImg,
    color: "#38bdf8",
    colorClass: "accent",
    emojis: "🧅🧄🏡😋✨",
    posts: [
      {
        id: "sca-1",
        caption: `🧅 A essência da boa cozinha em suas mãos! 🧄

Salsa, Cebola e Alho - a base perfeita para qualquer criação culinária.

O Tempero Salsa Cebola e Alho Temperanza Gastronomia traz o aroma envolvente e o sabor caseiro que transforma suas receitas.

✨ O segredo das melhores cozinheiras!`,
        hashtags: "#TemperanzaGastronomia #SalsaCebolaAlho #SaborDeCasa #TemperosNaturais #BasePerfeita #CozinhaCaseira #AromaDeCasa"
      },
      {
        id: "sca-2",
        caption: `🏡 Sabor de casa com toque gourmet!

Nossa combinação especial de Salsa, Cebola e Alho é o primeiro passo para pratos inesquecíveis.

Praticidade no preparo, sabor extraordinário no resultado! 😋

Perfeito para:
• Refogados aromáticos
• Carnes temperadas
• Sopas e caldos

Experimente hoje! 🧅`,
        hashtags: "#TemperanzaGastronomia #TemperosEssenciais #CozinhaDoDiaDia #SaborCaseiro #ReceitasTradicinais #TemperosGourmet #ComidaDeCasa"
      },
      {
        id: "sca-3",
        caption: `✨ O trio que nunca falha!

Salsa, Cebola e Alho - juntos, eles criam a magia que você sente em cada garfada daquela comida que só a vovó sabe fazer.

O Tempero Salsa Cebola e Alho Temperanza Gastronomia: tradição que você pode ter em casa todos os dias.

🧄 Compre já pelo link na bio!`,
        hashtags: "#TemperanzaGastronomia #TemperosClassicos #SaborDeVovo #CozinhaAfetiva #IngredientesNaturais #ReceitasDeFamilia #ComidaBrasileira"
      }
    ]
  },
  {
    id: "tempero-mineiro",
    name: "Tempero Mineiro Moído",
    image: temperoMineiroImg,
    color: "#fbbf24",
    colorClass: "gold",
    emojis: "🇧🇷⛰️🍲🧡",
    posts: [
      {
        id: "tm-1",
        caption: `⛰️ Uma viagem de sabor às montanhas de Minas!

O Tempero Mineiro Moído Temperanza Gastronomia traz toda a tradição da culinária mineira para sua mesa.

Autêntico. Regional. Inesquecível. 🧡

Perfeito para feijão tropeiro, tutu, carnes de panela e muito mais!

#ComidaMineiraComPaixão`,
        hashtags: "#TemperanzaGastronomia #TemperoMineiro #CulinariaMineir #TradicaoMineira #SaborDeMinas #ComidaMineira #ReceitasMineiras"
      },
      {
        id: "tm-2",
        caption: `🍲 O sabor que aquece o coração!

Direto das Minas Gerais para sua cozinha, nosso Tempero Mineiro Moído é a essência da hospitalidade e do amor pela boa mesa.

Cada pitada carrega:
❤️ Tradição centenária
🏔️ Sabor das montanhas
✨ Qualidade Temperanza

Experimente e apaixone-se!`,
        hashtags: "#TemperanzaGastronomia #MinasGerais #TemperoMineiro #GastronomiaBrasileira #SaborRegional #ComidaAfetiva #TradicaoCulinaria"
      },
      {
        id: "tm-3",
        caption: `🇧🇷 A alma de Minas em cada refeição!

O Tempero Mineiro Moído Temperanza Gastronomia é mais que um tempero - é uma homenagem à rica tradição culinária mineira.

Do fogão a lenha para sua cozinha moderna, mantendo toda a autenticidade.

⛰️ Traga Minas para seu lar!`,
        hashtags: "#TemperanzaGastronomia #TemperoMineiro #CozinhaMineira #SaborInconfundivel #TradicaoBrasileira #ComidaDeRaiz #ReceitasCaseiras"
      }
    ]
  }
];
