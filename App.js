import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

const MAX_RODADAS = 5; // Número predefinido de rodadas

const App = () => {
  const [pokemon, setPokemon] = useState({});
  const [palpite, setPalpite] = useState('');
  const [retorno, setRetorno] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [rodadasRestantes, setRodadasRestantes] = useState(MAX_RODADAS);
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null); // Armazena o resultado final
  const [mostrarBotaoProximo, setMostrarBotaoProximo] = useState(false); // Estado para mostrar o botão "Próximo Pokémon"

  useEffect(() => {
    if (jogoIniciado && rodadasRestantes > 0) {
      buscarNovoPokemon();
    }
  }, [jogoIniciado]);

  const buscarNovoPokemon = async () => {
    try {
      const id = Math.floor(Math.random() * 1000) + 1; // ID aleatório de Pokémon
      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const dados = await resposta.json();
      setPokemon(dados);
      setRetorno('');
      setMostrarBotaoProximo(false); // Esconde o botão "Próximo Pokémon" ao buscar um novo Pokémon
    } catch (erro) {
      console.error(erro);
    }
  };

  const verificarPalpite = () => {
    if (palpite.toLowerCase() === pokemon.name.toLowerCase()) {
      setRetorno('Correto!');
      setPontuacao(pontuacao + 1);
    } else {
      setRetorno('Incorreto. Tente novamente!');
    }
    setPalpite('');
    setRodadasRestantes(rodadasRestantes - 1);

    // Mostrar o botão "Próximo Pokémon" se ainda houver rodadas restantes
    if (rodadasRestantes > 1) {
      setMostrarBotaoProximo(true);
    } else {
      setJogoIniciado(false);
      setResultadoFinal(pontuacao);
    }
  };

  const mostrarProximoPokemon = () => {
    buscarNovoPokemon();
    setMostrarBotaoProximo(false);
  };

  const reiniciarJogo = () => {
    setPontuacao(0);
    setRodadasRestantes(MAX_RODADAS);
    setResultadoFinal(null);
    setJogoIniciado(true);
    setMostrarBotaoProximo(false); // Esconde o botão "Próximo Pokémon" ao reiniciar o jogo
  };

  const BotaoPersonalizado = ({ onPress, titulo, corDeFundo, corTexto }) => (
    <TouchableOpacity style={[estilos.botao, { backgroundColor: corDeFundo }]} onPress={onPress}>
      <Text style={[estilos.textoBotao, { color: corTexto }]}>{titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      {resultadoFinal !== null ? (
        <View style={estilos.telaResultado}>
          <Text style={estilos.tituloResultado}>Pontuação Final</Text>
          <Text style={estilos.pontuacaoResultado}>Você acertou {resultadoFinal} vez(es)!</Text>
          <BotaoPersonalizado 
            titulo="Reiniciar Jogo" 
            onPress={reiniciarJogo} 
            corDeFundo="#28A745" 
            corTexto="#FFFFFF" 
          />
        </View>
      ) : !jogoIniciado ? (
        <View style={estilos.telaInicio}>
          <Text style={estilos.titulo}>Bem-vindo ao Jogo de Adivinhação de Pokémon!</Text>
          <BotaoPersonalizado 
            titulo="Começar Jogo" 
            onPress={() => setJogoIniciado(true)} 
            corDeFundo="#DC3545" 
            corTexto="#FFFFFF" 
          />
        </View>
      ) : (
        <View style={estilos.telaJogo}>
          <Text style={estilos.titulo}>Adivinhe o Pokémon</Text>
          <Image
            source={{ uri: pokemon.sprites?.front_default }}
            style={estilos.imagem}
          />
          <TextInput
            style={estilos.input}
            value={palpite}
            onChangeText={setPalpite}
            placeholder="Digite o nome do Pokémon"
            placeholderTextColor="#6C757D"
          />
          <BotaoPersonalizado 
            titulo="Enviar Palpite" 
            onPress={verificarPalpite} 
            corDeFundo="#FFC107" 
            corTexto="#FFFFFF" 
          />
          {retorno ? <Text style={estilos.retorno}>{retorno}</Text> : null}
          <Text style={estilos.pontuacao}>Pontuação: {pontuacao}</Text>
          <Text style={estilos.pontuacao}>Rodadas Restantes: {rodadasRestantes}</Text>
          {mostrarBotaoProximo ? (
            <BotaoPersonalizado 
              titulo="Próximo Pokémon" 
              onPress={mostrarProximoPokemon} 
              corDeFundo="#FFC107" 
              corTexto="#FFFFFF" 
            />
          ) : null}
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA', // Fundo claro
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343A40', // Cor escura para o título
  },
  tituloResultado: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#28A745', // Cor verde para o resultado
  },
  imagem: {
    width: 150,
    height: 150,
    borderRadius: 10, // Bordas arredondadas para a imagem
    marginBottom: 16,
    borderColor: '#FFC107',
    borderWidth: 2,
  },
  input: {
    height: 40,
    borderColor: '#6C757D',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    width: '80%',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  retorno: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#DC3545', // Cor vermelha para o feedback
  },
  pontuacao: {
    fontSize: 18,
    marginTop: 16,
    color: '#495057', // Cor cinza para a pontuação
  },
  telaInicio: {
    alignItems: 'center',
  },
  telaJogo: {
    alignItems: 'center',
  },
  telaResultado: {
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pontuacaoResultado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 20,
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25, // Borda arredondada
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 10,
  },
  textoBotao: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;
