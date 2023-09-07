$(document).ready(function () {
    let questionIndex = 0;

    function addQuestion() {
        const questionTemplate = `
            <div class="field">
                <h4>Question ${questionIndex + 1}</h4>
                <input type="text" name="questions[${questionIndex}][text]" placeholder="Intitulé de la question" required>
                <div class="grouped.fields">
                    <label>Réponses :</label>
                    <div class="field">
                        <input type="radio" name="questions[${questionIndex}][answer]" value="A" required>
                        <input type="text" name="questions[${questionIndex}][choices][A]" placeholder="Option A" required>
                    </div>
                    <div class="field">
                        <input type="radio" name="questions[${questionIndex}][answer]" value="B">
                        <input type="text" name="questions[${questionIndex}][choices][B]" placeholder="Option B" required>
                    </div>
                    <div class="field">
                        <input type="radio" name="questions[${questionIndex}][answer]" value="C">
                        <input type="text" name="questions[${questionIndex}][choices][C]" placeholder="Option C" required>
                    </div>
                </div>
            </div>
        `;

        $('#questions').append(questionTemplate);
        questionIndex++;
    }

    $('#add-question').click(addQuestion);

    addQuestion();
});
