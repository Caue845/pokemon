import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal } from 'react-native';
import axios from 'axios';

const MAX_RODADAS = 5;

const App = () => {
  const [pokemon, setPokemon] = useState({});
  const [palpite, setPalpite] = useState('');
  const [retorno, setRetorno] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [rodadasRestantes, setRodadasRestantes] = useState(MAX_RODADAS);
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [mostrarBotaoProximo, setMostrarBotaoProximo] = useState(false);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (jogoIniciado && rodadasRestantes > 0) {
      buscarNovoPokemon();
    }
  }, [jogoIniciado]);

  useEffect(() => {
    if (mostrarRanking) {
      buscarRanking();
    }
  }, [mostrarRanking]);

  const buscarNovoPokemon = async () => {
    try {
      const id = Math.floor(Math.random() * 1000) + 1;
      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const dados = await resposta.json();
      setPokemon(dados);
      setRetorno('');
      setMostrarBotaoProximo(false);
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

    if (rodadasRestantes > 1) {
      setMostrarBotaoProximo(true);
    } else {
      setJogoIniciado(false);
      setResultadoFinal(pontuacao);
      setModalVisible(true); // Mostrar modal para entrada do nome
    }
  };

  const salvarPontuacao = async () => {
    try {
      await axios.post('http://172.16.11.20:3000/save-score', {
        nome,
        pontuacao
      });
      setModalVisible(false);
      setMostrarRanking(true); // Mostrar ranking após salvar a pontuação
    } catch (erro) {
      console.error('Erro ao salvar a pontuação:', erro);
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
    setMostrarBotaoProximo(false);
    setMostrarRanking(true); // Corrigido para não mostrar ranking ao reiniciar
  };

  const buscarRanking = async () => {
    try {
      const resposta = await axios.get('http://172.16.11.20:3000/ranking');
      setRanking(resposta.data);
    } catch (erro) {
      console.error('Erro ao buscar o ranking:', erro);
    }
  };

  const renderRankingItem = ({ item }) => (
    <View style={estilos.itemRanking}>
      <Text style={estilos.textoRanking}>{item.nome}: {item.pontuacao}</Text>
    </View>
  );

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
      ) : mostrarRanking ? (
        <View style={estilos.telaRanking}>
          <Text style={estilos.titulo}>Ranking dos Jogadores</Text>
          <FlatList
            data={ranking}
            renderItem={renderRankingItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <BotaoPersonalizado
            titulo="Voltar ao Início"
            onPress={() => setMostrarRanking(false)}
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

      {/* Modal para entrada do nome */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <Text style={estilos.modalTitle}>Digite seu Nome</Text>
            <TextInput
              style={estilos.modalInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
            />
            <BotaoPersonalizado 
              titulo="Salvar Pontuação" 
              onPress={salvarPontuacao} 
              corDeFundo="#28A745" 
              corTexto="#FFFFFF" 
            />
            <BotaoPersonalizado 
              titulo="Cancelar" 
              onPress={() => setModalVisible(false)} 
              corDeFundo="#DC3545" 
              corTexto="#FFFFFF" 
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343A40',
  },
  tituloResultado: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#28A745',
  },
  imagem: {
    width: 150,
    height: 150,
    borderRadius: 10,
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
    color: '#DC3545',
  },
  pontuacao: {
    fontSize: 18,
    marginTop: 16,
    color: '#495057',
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
    borderRadius: 25,
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
  telaRanking: {
    alignItems: 'center',
    padding: 20,
  },
  itemRanking: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  textoRanking: {
    fontSize: 18,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: '#6C757D',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
