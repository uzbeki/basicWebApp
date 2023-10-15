import { render, screen } from "@testing-library/react";
import SQLEditor from "@/app/components/SQLEditor";

describe("SQLEditor", () => {
    it("renders", () => {
        render(<SQLEditor />);
        expect(screen.getByRole("form")).toBeInTheDocument();
    });

    it("displays 'SQL Editor' inside <legend>", () => {
        render(<SQLEditor />);
        expect(screen.getByText("SQL Editor")).toBeInTheDocument();
    });

    it("has textarea and <select> tag", () => {
        render(<SQLEditor />);
        expect(screen.getByRole("textbox")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("has 5 submit buttons", () => {
        render(<SQLEditor />);
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBe(5);
    });
});
