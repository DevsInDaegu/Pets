import { renderToStaticMarkup } from "react-dom/server"
import { Search } from "@mui/icons-material"
import { Button, Alert, Divider, Typography } from "@mui/material"

export default class SearchDialog {

    constructor({addressString, coordinates, onClickSearch }) {
        const content = this.createContent({ addressString, coordinates })

        this.onClickSearch = onClickSearch
        this.popup = new Popup(
            new window.google.maps.LatLng(coordinates.lat, coordinates.lng),
            content
        )
    }

    setMap(map) {
        this.popup.wrapped.setMap(map)
    }

    createContent({ addressString, coordinates }) {
        const container = document.createElement('div')
        const content = <Alert icon={false}
            severity="success"
          variant="filled"
          style={{
              display: "inline-block",
              boxShadow: "0px 0px 5px 5px gray"
          }} >
            <Typography variant='body2'>{addressString}</Typography>
            <Divider />
            <Button 
                color="inherit"
                variant="contained"
                size="small"
                startIcon={<Search />}>찾기</Button>
        </Alert>
        container.innerHTML = renderToStaticMarkup(content)
        const button = container.querySelector("button")
        button.addEventListener("click", () => this.onClickSearch(coordinates))
        return container
    }

}

class Popup  {
    position;
    containerDiv;
    constructor(position, content) {
        if (window?.google?.maps?.OverlayView === undefined) {
            return
        }   
        this.wrapped = new window.google.maps.OverlayView()

        this.wrapped.position = position;
        content.classList.add("popup-bubble");

        // This zero-height div is positioned at the bottom of the bubble.
        const bubbleAnchor = document.createElement("div");

        bubbleAnchor.classList.add("popup-bubble-anchor");
        bubbleAnchor.appendChild(content);
        // This zero-height div is positioned at the bottom of the tip.
        this.wrapped.containerDiv = document.createElement("div");
        this.wrapped.containerDiv.classList.add("popup-container");
        this.wrapped.containerDiv.appendChild(bubbleAnchor);
        // Optionally stop clicks, etc., from bubbling up to the map.
        window.google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.wrapped.containerDiv);
        this.wrapped.onAdd = this.onAdd.bind(this)
        this.wrapped.onRemove = this.onRemove.bind(this)
        this.wrapped.draw = this.draw.bind(this)
    }
    /** Called when the popup is added to the map. */
    onAdd() {
        this.wrapped.getPanes().floatPane.appendChild(this.wrapped.containerDiv);
    }
    /** Called when the popup is removed from the map. */
    onRemove() {
        if (this.wrapped.containerDiv.parentElement) {
            this.wrapped.containerDiv.parentElement.removeChild(this.wrapped.containerDiv);
        }
    }
    /** Called each frame when the popup needs to draw itself. */
    draw() {
        const divPosition = this.wrapped.getProjection().fromLatLngToDivPixel(
            this.wrapped.position
        );

        // Hide the popup when it is far out of view.
        const display =
            Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
                ? "block"
                : "none";
        if (display === "block") {
            this.wrapped.containerDiv.style.left = divPosition.x + "px";
            this.wrapped.containerDiv.style.top = divPosition.y + "px";
            this.wrapped.containerDiv.style.position = "relative"
        }

        if (this.wrapped.containerDiv.style.display !== display) {
            this.wrapped.containerDiv.style.display = display;
        }
    }
}
    