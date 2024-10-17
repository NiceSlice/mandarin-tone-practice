const audioAssetsPath = "./assets/audio/";
let score = 0;
let type = "character";
let autoplay = false;

function play() {
  $("#audio")[0].play();
}

const tones = {
  0: " ",
  1: "ˉ",
  2: "ˊ",
  3: "ˇ",
  4: "ˋ",
};

function focusNextToneInput() {
  const activeElement = $(document.activeElement);

  if (activeElement.prop("tagName") !== "INPUT") {
    $(".tone-text-input:visible").first().trigger("focus");
    return;
  }

  const i = activeElement.attr("id").split("-").pop();
  $(`#tone-input-${Number(i) + 1}`).trigger("focus");
}

function focusPreviousToneInput() {
  const activeElement = $(document.activeElement);

  if (
    activeElement.prop("tagName") !== "INPUT" ||
    !activeElement.hasClass("tone-text-input")
  ) {
    $(".tone-text-input:visible").last().trigger("focus");
    return;
  }

  const i = activeElement.attr("id").split("-").pop();
  if (i == 0) return;

  $(`#tone-input-${Number(i) - 1}`).trigger("focus");
  $(`#tone-input-${Number(i) - 1}`)[0].setSelectionRange(1, 1);
}

function handleToneInput() {
  if ($(this).val() in tones) {
    $(this).val(tones[$(this).val()]);
    $(this).blur();

    // focus next input
    let i = $(this).attr("id").split("-").pop();
    $(`#tone-input-${Number(i) + 1}`).trigger("focus");
  } else {
    $(this).val("");
  }
}

function getToneInputGroup(i) {
  const toneInputGroup = $(".tone-input-group").first().clone();
  toneInputGroup.show();
  toneInputGroup
    .children(".tone-text-input")
    .attr({
      id: `tone-input-${i}`,
    })
    .on("input", handleToneInput);

  return toneInputGroup;
}

function setExpression(expression) {
  $("#audio").attr("src", audioAssetsPath + expression.filename);
  $("#tone-input-wrapper").children().slice(1).remove();

  let toneInputGroup;
  for (let i = 0; i < expression.tones.length; i++) {
    toneInputGroup = getToneInputGroup(i);
    $("#tone-input-wrapper").append(toneInputGroup);

    if (i === 0) {
      toneInputGroup.children("input").first().trigger("focus");
    }
  }

  if (autoplay) {
    play();
  }
}

function getRandomNumber(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getExpression(expressionType = "character") {
  const length = audioData[expressionType].length;
  const i = getRandomNumber(0, length - 1);

  const filename = audioData[expressionType][i];
  const tones = filename.split("_")[1].split(".")[0];

  return {
    filename,
    tones: tones.split(""),
  };
}

let showAnswer = false;

function correct() {
  showAnswer = true;
  $("#correct").show();

  score++;
  $("#score-number").html(score);
}

function toneNumbersToText(toneNumbers) {
  return toneNumbers
    .split("")
    .map((n) => tones[n])
    .join("");
}

function incorrect(correctTones) {
  showAnswer = true;
  $("#incorrect").html(toneNumbersToText(correctTones));
  $("#incorrect").show();
}

function showNextExpression() {
  showAnswer = false;
  $("#correct").hide();
  $("#incorrect").hide();

  let expression = getExpression(type);
  setExpression(expression);
}

function getTonesFromFilename(filename) {
  return filename.split("_").pop().split(".")[0];
}

function validate() {
  const toneInputs = $(".tone-text-input:visible");
  const filename = $("#audio").attr("src");
  const correctTones = getTonesFromFilename(filename);

  let toneInputValue;
  for (let i = 0; i < toneInputs.length; i++) {
    toneInputValue = toneInputs[i].value;

    if (toneInputValue !== tones[correctTones[i]]) {
      incorrect(correctTones);
      return;
    }
  }

  correct();
}

function continueToNext() {
  if (showAnswer) {
    showNextExpression();
  } else {
    validate();
  }
}

$(document).ready(() => {
  showNextExpression();

  $("#play-button").on("click", function () {
    play();
  });

  $(".type-option").on("click", function () {
    if ($(this).hasClass("type-option-selected")) {
      return;
    }

    $(".type-option-selected").removeClass("type-option-selected");
    $(this).addClass("type-option-selected");

    type = $(this).val();
    showNextExpression();
  });

  $("#info-icon").on("click", function (e) {
    e.stopPropagation();
    closeMenus(e);
    $("#info-pop-up-menu").show();
  });

  $("#settings-icon").on("click", function (e) {
    e.stopPropagation();
    closeMenus(e);
    $("#settings-pop-up-menu").show();
  });

  $("#autoplay").on("change", function () {
    autoplay = $(this).is(":checked");
  });

  $("#continue-button").on("click", function () {
    continueToNext();
  });
});

function closeMenus(e) {
  if (
    $(e.target).closest("#settings-pop-up-menu").length === 0 &&
    $("#settings-pop-up-menu").is(":visible")
  ) {
    $("#settings-pop-up-menu").hide();
  }
  if (
    $(e.target).closest("#info-pop-up-menu").length === 0 &&
    $("#info-pop-up-menu").is(":visible")
  ) {
    $("#info-pop-up-menu").hide();
  }
}

$(document).on("click", function (e) {
  closeMenus(e);
});

const shortcuts = {
  " ": play,
  Enter: continueToNext,
  ArrowRight: focusNextToneInput,
  ArrowLeft: focusPreviousToneInput,
};

$(document).on("keydown", (e) => {
  if (e.key in shortcuts) {
    shortcuts[e.key]();
    e.preventDefault();
    e.stopPropagation();
  }
});
