import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ContextProvider, useCart } from "../../../context";
import { BrowserRouter } from "react-router";
import { Wrapper } from "../../../routes/helpers";
import Cart from "..";

export const mockFetch = jest.fn((url: string) => {
  if (url.includes("/categories")) {
    return Promise.resolve({
      json: () => Promise.resolve({}),
    });
  }
  if (url.includes("/products")) {
    return Promise.resolve({
      json: () => Promise.resolve({}),
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({}),
  });
});

global.fetch = mockFetch as jest.Mock;

const mockNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

const CartItemStub = () => {
  const { addItem } = useCart();

  const addITesteItem = () => {
    addItem({
      id: 1,
      name: "Test Item",
      price: 100,
      quantity: 1,
      image: "test-image.jpg",
      description: "Test Description",
      category: 1,
      colors: ["preto"],
      sizes: ["M"],
    });
  };
  return (
    <button onClick={addITesteItem} data-testid="add-item">
      Adicionar Item de teste
    </button>
  );
};

const renderCart = () => {
  render(
    <BrowserRouter>
      <ContextProvider>
        <Wrapper>
          <CartItemStub />
          <Cart />
        </Wrapper>
      </ContextProvider>
    </BrowserRouter>
  );
};

describe("Cart", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  test('deve navegar para a home ao clicar em "Continuar comprando" quando o carrinho está vazio', async () => {
    renderCart();

    // Use findBy* to wait for the component to settle after async operations (e.g., fetch)
    expect(
      await screen.findByText("Seu carrinho está vazio")
    ).toBeInTheDocument();

    const continueShoppingButton = screen.getByText("Continuar comprando");
    fireEvent.click(continueShoppingButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("deve renderizar o carrinho com itens", async () => {
    await renderCart();
    const addItemButton = screen.getByTestId("add-item");
    await act(() => {
      fireEvent.click(addItemButton);
    });
    expect(await screen.getByAltText("Test Item")).toBeInTheDocument();
    //expect(await screen.getByText('R$ 10,00')).toBeInTheDocument();

    // Adiciona mais um item
    const incrementButton = screen.getAllByRole("button", { name: "+" });
    // clicar no Botao +
    await act(() => {
      fireEvent.click(incrementButton[0]);
    });
    // informa que o valor do item foi alterado
    expect(await screen.getByText("2")).toBeInTheDocument();

    // Remover um produto
    // remove um mais um item
    const decrementButton = screen.getAllByRole("button", { name: "-" });
    // clicar no Botao -
    await act(() => {
      fireEvent.click(decrementButton[0]);
    });
    // informa que o valor do item foi alterado
    expect(await screen.getByText("1")).toBeInTheDocument();

    // Remove o item
    const removeButton = screen.getByAltText("trash");
    await act(() => {
      fireEvent.click(removeButton);
    });
    // informa que o valor do item foi alterado
    // Usa o queryBy* para verificar se o elemento não está presente na tela
    expect(screen.queryByText("Test Item")).not.toBeInTheDocument();
  });

  test("deve Finalizar o pedido", async () => {
    await renderCart();
    const addItemButton = screen.getByTestId("add-item");
    await act(async () => {
      fireEvent.click(addItemButton);
    });
    const finalizarPedidoButton = screen.getByText("Finalizar pedido");
    await act(async () => {
      fireEvent.click(finalizarPedidoButton);
    });

    expect(screen.getByText("Processando...")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText("Pedido Realizado!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(
      screen.getByText("Seu pedido foi processado com sucesso")
    ).toBeInTheDocument();
    const returnButton = screen.getByText("Voltar para a loja");
    await act(async () => {
      fireEvent.click(returnButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
