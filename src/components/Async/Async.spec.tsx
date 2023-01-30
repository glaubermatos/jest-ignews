import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { Async } from '.'

describe('Async component', () => {
    it('reders correctly', async () => {
        render(<Async />)

        expect(screen.getByText('Hello world')).toBeInTheDocument()

        // para testar se um compoenente aparaceu ou nao em tela, quando 
        // tem uma função assincrona, por padrão o jest não fica esperando
        // o metodo que inicia com o prefixo find espera algo acontecer, mas para isso
        // precisa usar o async/await pq o metodo findByText retorna uma Promise
        expect(await screen.findByText('Button')).toBeInTheDocument()
    });

    // na documentação do testing libriry existe a opção de usar o waitFor
    it('reders correctly with waitFor', async () => {
        render(<Async />)

        expect(screen.getByText('Hello world')).toBeInTheDocument()

        await waitFor(() => {
           return expect(screen.getByText('Button')).toBeInTheDocument()
        })
    });
    
    it('reders correctly with waitFor: not.toBeInTheDocument', async () => {
        render(<Async />)

        expect(screen.getByText('Hello world')).toBeInTheDocument()

        await waitFor(() => {
           return expect(screen.queryByText('Button 2')).not.toBeInTheDocument()
        })
    });

    // tanto o findByText quanto o waitFor eles aguardam algo ser adicionado em tela
    // quando queremos checar se o elemento saiu da tela ou não, 
    // podemos usar o waitForElementToBeRemoved
    it('reders correctly with waitForElementToBeRemoved', async () => {
        render(<Async />)

        expect(screen.getByText('Hello world')).toBeInTheDocument()

        // neste caso vamos usar o queryByText do screen, esse método não retorna erro
        // caso não encontre nada
        await waitForElementToBeRemoved(screen.queryByText('Button 2'))
    })

    // os metodos que começam com get eles retornam o objeto de forma sincrona
    // ou seja se ele não tiver em tela no momento que ese codigo executar ele não vai agauardar
    // e caso não encontra vai da erro

    // o query ele procura pelo elemento e se não encontar não vai dar erro, 
    // mas ele procura de forma sincrona tb

    // o find se não existir fica monitorando para ver se o elemento vai aparecer, se não aparecer vai dar erro
})