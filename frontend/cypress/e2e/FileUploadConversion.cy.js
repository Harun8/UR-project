
describe("File upload conversion test", () => {
  it("should be able to upload and convert a .urp file (PS5) to a compatible .urpx file (PSX)", () => {
    // one second is not good should tell cypress to wait for it to render fully
    cy.visit("http://localhost:5173").wait(1000);
    // cy.get(`[ data-testid="upload-file-btn"]`).should("exist").click();
    cy.get('input[type="file"]').selectFile("cypress/fixtures/cc.urp", {
      force: true,
    });
    cy.get(`[ data-testid="convert-btn"]`).should("exist").click();

   
    // cy.get(`[ data-testid="password-field"]`).should("exist").type("test123");

    // cy.get(`[ data-testid="login-btn"]`).should("exist").click();

    // cy.get(`[ data-testid="chat-page-link"]`).should("exist").click();

    // cy.get(`[ data-testid="uploadPDF-btn"]`).should("exist").click();



    // cy.get(`[  data-testid="chat-textfield"]`)
    //   .should("exist")
    //   .type("What is this pdf about?")
    //   .wait(8000);

    // cy.get(`[  data-testid="chat-btn"]`).should("exist").click();
  });
});